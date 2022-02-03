import { STS } from "@aws-sdk/client-sts"
import { CallerIdentity } from "@takomo/aws-model"
import { InternalAwsClientProps } from "../common/client"
import { customLogger } from "../common/logger"
import { customRetryStrategy } from "../common/retry"

/**
 * @hidden
 */
export interface StsClient {
  readonly getCallerIdentity: () => Promise<CallerIdentity>
}

/**
 * @hidden
 */
export const createStsClient = (props: InternalAwsClientProps): StsClient => {
  const client = new STS({
    region: props.region,
    credentials: props.credentialProvider,
    retryStrategy: customRetryStrategy(),
    logger: customLogger(props.logger),
  })

  client.middlewareStack.use(props.middleware)

  const getCallerIdentity = (): Promise<CallerIdentity> =>
    client.getCallerIdentity({}).then((res) => ({
      accountId: res.Account!,
      arn: res.Arn!,
      userId: res.UserId!,
    }))

  return {
    getCallerIdentity,
  }
}
