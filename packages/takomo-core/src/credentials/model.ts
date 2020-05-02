import { deepCopy, formatYaml, indentLines, TakomoError } from "@takomo/util"
import {
  ChainableTemporaryCredentials,
  CredentialProviderChain,
  Credentials,
  STS,
} from "aws-sdk"
import { AccountId, IamRoleArn } from "../model"

/**
 * Identity used to invoke AWS APIs.
 */
export interface CallerIdentity {
  /**
   * Identity ARN.
   */
  readonly arn: string

  /**
   * User id.
   */
  readonly userId: string

  /**
   * Account id.
   */
  readonly accountId: AccountId
}

/**
 * Provides AWS credentials to be used to invoke AWS APIs.
 */
export interface TakomoCredentialProvider {
  /**
   * @returns Name
   */
  getName: () => string

  /**
   * @returns AWS credentials
   */
  getCredentials: () => Promise<Credentials>

  /**
   * @returns Identity associated with the credentials
   */
  getCallerIdentity: () => Promise<CallerIdentity>

  /**
   * Create a new credential provider for the given command role.
   *
   * @param iamRoleArn IAM role ARN
   * @returns Credential provider
   */
  createCredentialProviderForRole: (
    iamRoleArn: IamRoleArn,
  ) => Promise<TakomoCredentialProvider>
}

interface TakomoCredentialProviderProps {
  readonly name: string
  readonly credentialProviderChain: CredentialProviderChain
}

export class StdTakomoCredentialProvider implements TakomoCredentialProvider {
  private readonly credentialProviderChain: CredentialProviderChain
  private readonly name: string
  private readonly sts: STS
  private callerIdentity: CallerIdentity | null = null

  constructor({
    name,
    credentialProviderChain,
  }: TakomoCredentialProviderProps) {
    this.credentialProviderChain = credentialProviderChain
    this.name = name

    this.sts = new STS({
      region: "us-east-1",
      credentials: null,
      credentialProvider: credentialProviderChain,
    })
  }

  getName = (): string => this.name

  createCredentialProviderForRole = async (
    iamRoleArn: IamRoleArn,
  ): Promise<TakomoCredentialProvider> => {
    const masterCredentials = await this.getCredentials()
    const name = `${this.name}/${iamRoleArn}`
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

    return new StdTakomoCredentialProvider({
      name,
      credentialProviderChain,
    })
  }

  getCredentials = async (): Promise<Credentials> =>
    this.credentialProviderChain.resolvePromise()

  getCallerIdentity = async (): Promise<CallerIdentity> => {
    if (this.callerIdentity) {
      return this.callerIdentity
    }

    return this.sts
      .getCallerIdentity({})
      .promise()
      .then((res) => {
        this.callerIdentity = {
          accountId: res.Account!,
          arn: res.Arn!,
          userId: res.UserId!,
        }

        return this.callerIdentity
      })
  }

  toString = (): string => this.getName()
}

export class CredentialsError extends TakomoError {
  constructor(e: Error) {
    super(
      `AWS credentials error:\n\n${indentLines(formatYaml(deepCopy(e)), 2)}`,
    )
  }
}
