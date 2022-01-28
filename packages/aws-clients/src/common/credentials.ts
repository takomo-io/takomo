import { defaultProvider } from "@aws-sdk/credential-provider-node"
import { fromTemporaryCredentials } from "@aws-sdk/credential-providers"
import { CredentialProvider, Credentials } from "@aws-sdk/types"
import { CallerIdentity, CredentialsError, IamRoleArn } from "@takomo/aws-model"
import { TkmLogger } from "@takomo/util"
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
   * @returns CredentialProvider
   */
  readonly getCredentialProvider: () => CredentialProvider

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
  readonly credentialProvider: CredentialProvider
  readonly awsClientProvider: AwsClientProvider
  readonly logger: TkmLogger
}

/**
 * @hidden
 */
export const createCredentialManager = ({
  name,
  credentialProvider,
  logger,
  awsClientProvider,
}: CredentialManagerProps): InternalCredentialManager => {
  const children = new Map<string, InternalCredentialManager>()

  const getCredentials = async (): Promise<Credentials> => credentialProvider()

  const getCredentialProvider = (): CredentialProvider => credentialProvider

  const createCredentialManagerForRole = async (
    iamRoleArn: IamRoleArn,
  ): Promise<CredentialManager> => {
    const child = createCredentialManager({
      name: `${name}/${iamRoleArn}`,
      awsClientProvider,
      logger,
      credentialProvider: fromTemporaryCredentials({
        masterCredentials: credentialProvider,
        clientConfig: {
          region: "us-east-1",
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
  }
}

const initDefaultCredentialProviderChain = async (
  mfaTokenCodeProvider: (mfaSerial: string) => Promise<string>,
  credentials?: Credentials,
): Promise<CredentialProvider> => {
  // const tokenCodeFn = (
  //   mfaSerial: string,
  //   callback: (err?: Error, token?: string) => void,
  // ) => {
  //   mfaTokenCodeProvider(mfaSerial)
  //     .then((token) => callback(undefined, token))
  //     .catch(callback)
  // }

  if (credentials) {
    return async () => credentials
  }

  return defaultProvider()
  // const providers = [
  //   () => new EnvironmentCredentials("AWS"),
  //   () => new EnvironmentCredentials("AMAZON"),
  //   () => new ECSCredentials(),
  //   () => new SharedIniFileCredentials({ tokenCodeFn }),
  //   () => new ProcessCredentials(),
  // ]
  //
  // if (await isAwsMetaEndpointAvailable()) {
  //   providers.push(() => new EC2MetadataCredentials())
  // }
  //
  // return credentials
  //   ? new CredentialProviderChain([() => credentials, ...providers])
  //   : new CredentialProviderChain(providers)
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
  initDefaultCredentialProviderChain(mfaTokenCodeProvider, credentials).then(
    (credentialProvider) =>
      createCredentialManager({
        name: "default",
        logger,
        awsClientProvider,
        credentialProvider,
      }),
  )
