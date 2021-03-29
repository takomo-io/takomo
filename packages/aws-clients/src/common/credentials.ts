import { CallerIdentity, CredentialsError, IamRoleArn } from "@takomo/aws-model"
import { deepFreeze } from "@takomo/util"
import {
  ChainableTemporaryCredentials,
  CredentialProviderChain,
  Credentials,
  EC2MetadataCredentials,
  ECSCredentials,
  EnvironmentCredentials,
  ProcessCredentials,
  SharedIniFileCredentials,
  STS,
} from "aws-sdk"
import http from "http"
import R from "ramda"

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

interface CredentialManagerProps {
  readonly name: string
  readonly credentialProviderChain: CredentialProviderChain
}

/**
 * @hidden
 */
export const createCredentialManager = ({
  name,
  credentialProviderChain,
}: CredentialManagerProps): CredentialManager => {
  const sts = new STS({
    region: "us-east-1",
    credentials: null,
    credentialProvider: credentialProviderChain,
  })

  const getCredentials = (): Promise<Credentials> =>
    credentialProviderChain.resolvePromise()

  const createCredentialManagerForRole = async (
    iamRoleArn: IamRoleArn,
  ): Promise<CredentialManager> => {
    const masterCredentials = await getCredentials()
    const credentialProviderChain = new CredentialProviderChain([
      () =>
        new ChainableTemporaryCredentials({
          params: {
            RoleArn: iamRoleArn,
            DurationSeconds: 3600,
            RoleSessionName: "takomo",
          },
          masterCredentials,
        }),
    ])

    return createCredentialManager({
      credentialProviderChain,
      name: `${name}/${iamRoleArn}`,
    })
  }

  const getCallerIdentity = R.memoizeWith(
    () => "",
    (): Promise<CallerIdentity> =>
      sts
        .getCallerIdentity({})
        .promise()
        .then((res) => ({
          accountId: res.Account!,
          arn: res.Arn!,
          userId: res.UserId!,
        }))
        .catch((e) => {
          throw new CredentialsError(e)
        }),
  )

  const toString = (): string => name

  return deepFreeze({
    name,
    createCredentialManagerForRole,
    getCallerIdentity,
    getCredentials,
    toString,
  })
}

const isAwsMetaEndpointAvailable = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
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
  credentials?: Credentials,
): Promise<CredentialManager> =>
  initDefaultCredentialProviderChain(mfaTokenCodeProvider, credentials)
    .then((credentialProviderChain) =>
      createCredentialManager({
        name: "default",
        credentialProviderChain,
      }),
    )
    .then((cp) => cp.getCallerIdentity().then(() => cp))
