import {
  AssumeRoleCommand,
  AssumeRoleCommandInput,
  AssumeRoleWithWebIdentityCommand,
  AssumeRoleWithWebIdentityCommandInput,
  STS,
} from "@aws-sdk/client-sts"
import { AwsCredentialIdentity } from "@aws-sdk/types"
import { InternalAwsClientProps } from "../common/client.js"
import { CallerIdentity } from "../common/model.js"
import { customRequestHandler } from "../common/request-handler.js"
import { customRetryStrategy } from "../common/retry.js"
import {
  apiRequestListenerMiddleware,
  apiRequestListenerMiddlewareOptions,
} from "../common/request-listener.js"

export interface StsClient {
  readonly getCallerIdentity: () => Promise<CallerIdentity>
  readonly assumeRole: (
    input: AssumeRoleCommandInput,
  ) => Promise<AwsCredentialIdentity>
  readonly assumeRoleWithWebIdentity: (
    input: AssumeRoleWithWebIdentityCommandInput,
  ) => Promise<AwsCredentialIdentity>
}

export const createStsClient = (props: InternalAwsClientProps): StsClient => {
  const client = new STS({
    region: props.region,
    credentials: props.credentialProvider,
    retryStrategy: customRetryStrategy(props.logger),
    requestHandler: customRequestHandler(25),
  })

  client.middlewareStack.add(
    apiRequestListenerMiddleware(props.logger, props.id, props.listener),
    apiRequestListenerMiddlewareOptions,
  )

  const getCallerIdentity = (): Promise<CallerIdentity> =>
    client.getCallerIdentity({}).then((res) => ({
      accountId: res.Account!,
      arn: res.Arn!,
      userId: res.UserId!,
    }))

  const assumeRole = (
    input: AssumeRoleCommandInput,
  ): Promise<AwsCredentialIdentity> => {
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
  ): Promise<AwsCredentialIdentity> => {
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
