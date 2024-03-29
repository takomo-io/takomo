import {
  AssumeRoleCommandInput,
  AssumeRoleWithWebIdentityCommandInput,
} from "@aws-sdk/client-sts"
import {
  fromEnv,
  fromNodeProviderChain,
  fromTemporaryCredentials,
} from "@aws-sdk/credential-providers"
import {
  AwsCredentialIdentity,
  AwsCredentialIdentityProvider,
} from "@aws-sdk/types"
import * as R from "ramda"
import { TkmLogger } from "../../utils/logging.js"
import { AwsClientProvider } from "../aws-client-provider.js"
import { CredentialsError } from "./error.js"
import { CallerIdentity, IamRoleArn } from "./model.js"
import { customRetryStrategy } from "./retry.js"

/**
 * Provides AWS credentials that can be used to invoke AWS APIs.
 */
export interface CredentialManager {
  /**
   * Credential manager name
   */
  readonly name: string

  /**
   * @returns AWS credentials
   */
  readonly getCredentials: () => Promise<AwsCredentialIdentity>

  /**
   * @returns CredentialProvider
   */
  readonly getCredentialProvider: () => AwsCredentialIdentityProvider

  /**
   * @returns Identity associated with the credentials
   */
  readonly getCallerIdentity: () => Promise<CallerIdentity>

  /**
   * Create a new credential manager for the given command role.
   *
   * @param iamRoleArn IAM role ARN
   * @returns Credential provider
   */
  readonly createCredentialManagerForRole: (
    iamRoleArn: IamRoleArn,
  ) => Promise<CredentialManager>
}

export interface InternalCredentialManager extends CredentialManager {
  readonly iamRoleArn?: IamRoleArn
  readonly children: Map<string, InternalCredentialManager>
  readonly createCredentialManagerForRole: (
    iamRoleArn: IamRoleArn,
  ) => Promise<InternalCredentialManager>
}

interface CredentialManagerProps {
  readonly name: string
  readonly iamRoleArn?: IamRoleArn
  readonly credentialProvider: AwsCredentialIdentityProvider
  readonly awsClientProvider: AwsClientProvider
  readonly logger: TkmLogger
}

export const createCredentialManager = ({
  name,
  credentialProvider,
  logger,
  awsClientProvider,
  iamRoleArn: cmIamRoleArn,
}: CredentialManagerProps): InternalCredentialManager => {
  const children = new Map<string, InternalCredentialManager>()

  const getCredentials = async (): Promise<AwsCredentialIdentity> =>
    credentialProvider()

  const getCredentialProvider = (): AwsCredentialIdentityProvider =>
    credentialProvider

  const createCredentialManagerForRole = async (
    iamRoleArn: IamRoleArn,
  ): Promise<InternalCredentialManager> => {
    const child = createCredentialManager({
      iamRoleArn,
      name: `${name}/${iamRoleArn}`,
      awsClientProvider,
      logger,
      credentialProvider: fromTemporaryCredentials({
        masterCredentials: credentialProvider,
        clientConfig: {
          region: "us-east-1",
          retryStrategy: customRetryStrategy(logger),
        },
        params: {
          RoleArn: iamRoleArn,
          DurationSeconds: 3600,
          RoleSessionName: "takomo",
        },
      }),
    })

    children.set(`${name}/${iamRoleArn}`, child)

    return child
  }

  const getCallerIdentity = R.memoizeWith(
    () => "",
    (): Promise<CallerIdentity> =>
      awsClientProvider
        .createStsClient({
          region: "us-east-1",
          id: "sts",
          logger,
          credentialProvider,
        })
        .then((client) =>
          client.getCallerIdentity().catch((e) => {
            console.log(e)
            throw new CredentialsError(e)
          }),
        ),
  )

  return {
    name,
    children,
    createCredentialManagerForRole,
    getCallerIdentity,
    getCredentials,
    getCredentialProvider,
    iamRoleArn: cmIamRoleArn,
  }
}

const initDefaultCredentialProviderChain = async (
  logger: TkmLogger,
  awsClientProvider: AwsClientProvider,
  mfaCodeProvider: (mfaSerial: string) => Promise<string>,
  credentials?: AwsCredentialIdentity,
): Promise<AwsCredentialIdentityProvider> => {
  if (credentials) {
    return async () => credentials
  }

  if (
    process.env["AWS_ACCESS_KEY_ID"] &&
    process.env["AWS_SECRET_ACCESS_KEY"]
  ) {
    return fromEnv()
  }

  return fromNodeProviderChain({
    mfaCodeProvider,
    roleAssumer: customDefaultRoleAssumer(logger, awsClientProvider),
    roleAssumerWithWebIdentity: customDefaultRoleAssumerWithWebIdentity(
      logger,
      awsClientProvider,
    ),
  })
}

export const initDefaultCredentialManager = async (
  mfaCodeProvider: (mfaSerial: string) => Promise<string>,
  logger: TkmLogger,
  awsClientProvider: AwsClientProvider,
  credentials?: AwsCredentialIdentity,
): Promise<InternalCredentialManager> =>
  initDefaultCredentialProviderChain(
    logger,
    awsClientProvider,
    mfaCodeProvider,
    credentials,
  ).then((credentialProvider) =>
    createCredentialManager({
      name: "default",
      logger,
      awsClientProvider,
      credentialProvider,
    }),
  )

type RoleAssumer = (
  sourceCredentials: AwsCredentialIdentity,
  params: AssumeRoleCommandInput,
) => Promise<AwsCredentialIdentity>

const customDefaultRoleAssumer =
  (logger: TkmLogger, awsClientProvider: AwsClientProvider): RoleAssumer =>
  async (sourceCredentials, params) => {
    const id = "defaultRoleAssumer"
    const sts = await awsClientProvider.createStsClient({
      id,
      logger: logger.childLogger(id),
      credentialProvider: async () => sourceCredentials,
      region: "us-east-1",
    })

    return sts.assumeRole(params)
  }

type RoleAssumerWithWebIdentity = (
  params: AssumeRoleWithWebIdentityCommandInput,
) => Promise<AwsCredentialIdentity>

const customDefaultRoleAssumerWithWebIdentity =
  (
    logger: TkmLogger,
    awsClientProvider: AwsClientProvider,
  ): RoleAssumerWithWebIdentity =>
  async (params) => {
    const id = "defaultRoleAssumerWithWebIdentity"
    const sts = await awsClientProvider.createStsClient({
      id,
      region: "us-east-1",
      logger: logger.childLogger(id),
    })

    return sts.assumeRoleWithWebIdentity(params)
  }
