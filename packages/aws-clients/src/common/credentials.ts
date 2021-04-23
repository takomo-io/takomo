import { CallerIdentity, CredentialsError, IamRoleArn } from "@takomo/aws-model"
import { deepFreeze, TkmLogger } from "@takomo/util"
import {
  ChainableTemporaryCredentials,
  CredentialProviderChain,
  Credentials,
  EC2MetadataCredentials,
  ECSCredentials,
  EnvironmentCredentials,
  ProcessCredentials,
  SharedIniFileCredentials,
} from "aws-sdk"
import http from "http"
import R from "ramda"
import { AwsClientProvider } from "../aws-client-provider"

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
  readonly getCredentials: () => Promise<Credentials>

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

/**
 * @hidden
 */
export interface InternalCredentialManager extends CredentialManager {
  readonly children: Map<string, InternalCredentialManager>
}

interface CredentialManagerProps {
  readonly name: string
  readonly credentials: Credentials
  readonly awsClientProvider: AwsClientProvider
  readonly logger: TkmLogger
}

/**
 * @hidden
 */
export const createCredentialManager = ({
  name,
  credentials,
  logger,
  awsClientProvider,
}: CredentialManagerProps): InternalCredentialManager => {
  const children = new Map<string, InternalCredentialManager>()

  const getCredentials = async (): Promise<Credentials> => credentials

  const createCredentialManagerForRole = async (
    iamRoleArn: IamRoleArn,
  ): Promise<CredentialManager> => {
    const child = createCredentialManager({
      name: `${name}/${iamRoleArn}`,
      awsClientProvider,
      logger,
      credentials: new ChainableTemporaryCredentials({
        params: {
          RoleArn: iamRoleArn,
          DurationSeconds: 3600,
          RoleSessionName: "takomo",
        },
        masterCredentials: credentials,
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
          credentials,
        })
        .getCallerIdentity()
        .catch((e) => {
          throw new CredentialsError(e)
        }),
  )

  return deepFreeze({
    name,
    children,
    createCredentialManagerForRole,
    getCallerIdentity,
    getCredentials,
  })
}

const isAwsMetaEndpointAvailable = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const options = {
      method: "GET",
      host: "169.254.169.254",
      port: 80,
      path: "/latest/meta-data/",
      timeout: 50,
    }

    const req = http.request(options, (r) => {
      resolve(r.statusCode === 200)
    })

    req.on("timeout", () => {
      req.destroy()
    })

    req.on("error", () => {
      resolve(false)
    })

    req.end()
  })
}

const initDefaultCredentialProviderChain = async (
  mfaTokenCodeProvider: (mfaSerial: string) => Promise<string>,
  credentials?: Credentials,
): Promise<CredentialProviderChain> => {
  const tokenCodeFn = (
    mfaSerial: string,
    callback: (err?: Error, token?: string) => void,
  ) => {
    mfaTokenCodeProvider(mfaSerial)
      .then((token) => callback(undefined, token))
      .catch(callback)
  }

  const providers = [
    () => new EnvironmentCredentials("AWS"),
    () => new EnvironmentCredentials("AMAZON"),
    () => new ECSCredentials(),
    () => new SharedIniFileCredentials({ tokenCodeFn }),
    () => new ProcessCredentials(),
  ]

  if (await isAwsMetaEndpointAvailable()) {
    providers.push(() => new EC2MetadataCredentials())
  }

  return credentials
    ? new CredentialProviderChain([() => credentials, ...providers])
    : new CredentialProviderChain(providers)
}

/**
 * @hidden
 */
export const initDefaultCredentialManager = async (
  mfaTokenCodeProvider: (mfaSerial: string) => Promise<string>,
  logger: TkmLogger,
  awsClientProvider: AwsClientProvider,
  credentials?: Credentials,
): Promise<InternalCredentialManager> =>
  initDefaultCredentialProviderChain(mfaTokenCodeProvider, credentials)
    .then((credentialProviderChain) => credentialProviderChain.resolvePromise())
    .then((credentials) =>
      createCredentialManager({
        name: "default",
        logger,
        awsClientProvider,
        credentials,
      }),
    )
