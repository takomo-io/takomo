import {
  AssumeRoleCommand,
  AssumeRoleCommandInput,
  AssumeRoleWithWebIdentityCommand,
  AssumeRoleWithWebIdentityCommandInput,
  STS,
} from "@aws-sdk/client-sts"
import { Credentials } from "@aws-sdk/types"
import { CallerIdentity } from "@takomo/aws-model"
import { InternalAwsClientProps } from "../common/client"
import { customRequestHandler } from "../common/request-handler"
import { customRetryStrategy } from "../common/retry"

/**
 * @hidden
 */
export interface StsClient {
  readonly getCallerIdentity: () => Promise<CallerIdentity>
  readonly assumeRole: (input: AssumeRoleCommandInput) => Promise<Credentials>
  readonly assumeRoleWithWebIdentity: (
    input: AssumeRoleWithWebIdentityCommandInput,
  ) => Promise<Credentials>
}

/**
 * @hidden
 */
export const createStsClient = (props: InternalAwsClientProps): StsClient => {
  const client = new STS({
    region: props.region,
    credentials: props.credentialProvider,
    retryStrategy: customRetryStrategy(),
    requestHandler: customRequestHandler(25),
  })

  client.middlewareStack.use(props.middleware)

  const getCallerIdentity = (): Promise<CallerIdentity> =>
    client.getCallerIdentity({}).then((res) => ({
      accountId: res.Account!,
      arn: res.Arn!,
      userId: res.UserId!,
    }))

  const assumeRole = (input: AssumeRoleCommandInput): Promise<Credentials> => {
    const additionalParams: Pick<AssumeRoleCommandInput, "RoleSessionName"> = {
      RoleSessionName: "takomo",
    }

    return client
      .send(new AssumeRoleCommand({ ...input, ...additionalParams }))
      .then(({ Credentials }) => ({
        accessKeyId: Credentials!.AccessKeyId!,
        secretAccessKey: Credentials!.SecretAccessKey!,
        sessionToken: Credentials!.SessionToken!,
        expiration: Credentials!.Expiration!,
      }))
  }

  const assumeRoleWithWebIdentity = (
    input: AssumeRoleWithWebIdentityCommandInput,
  ): Promise<Credentials> => {
    const additionalParams: Pick<
      AssumeRoleWithWebIdentityCommandInput,
      "RoleSessionName"
    > = {
      RoleSessionName: "takomo",
    }

    return client
      .send(
        new AssumeRoleWithWebIdentityCommand({ ...input, ...additionalParams }),
      )
      .then(({ Credentials }) => ({
        accessKeyId: Credentials!.AccessKeyId!,
        secretAccessKey: Credentials!.SecretAccessKey!,
        sessionToken: Credentials!.SessionToken!,
        expiration: Credentials!.Expiration!,
      }))
  }

  return {
    getCallerIdentity,
    assumeRole,
    assumeRoleWithWebIdentity,
  }
}
