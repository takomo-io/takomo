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
  readonly credentials: Credentials
}

/**
 * @hidden
 */
export const createCredentialManager = ({
  name,
  credentials,
}: CredentialManagerProps): CredentialManager => {
  const getCredentials = async (): Promise<Credentials> => credentials

  const createCredentialManagerForRole = async (
    iamRoleArn: IamRoleArn,
  ): Promise<CredentialManager> =>
    createCredentialManager({
      name: `${name}/${iamRoleArn}`,
      credentials: new ChainableTemporaryCredentials({
        params: {
          RoleArn: iamRoleArn,
          DurationSeconds: 3600,
          RoleSessionName: "takomo",
        },
        masterCredentials: credentials,
      }),
    })

  const getCallerIdentity = R.memoizeWith(
    () => "",
    (): Promise<CallerIdentity> =>
      new STS({
        region: "us-east-1",
        credentials,
      })
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
    .then((credentialProviderChain) => credentialProviderChain.resolvePromise())
    .then((credentials) =>
      createCredentialManager({
        name: "default",
        credentials,
      }),
    )
