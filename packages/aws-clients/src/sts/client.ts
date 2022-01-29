import { STS } from "@aws-sdk/client-sts"
import { CallerIdentity } from "@takomo/aws-model"
import { AwsClientProps } from "../common/client"
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
export const createStsClient = (props: AwsClientProps): StsClient => {
  const client = new STS({
    region: props.region,
    credentials: props.credentialProvider,
    retryStrategy: customRetryStrategy(),
  })

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
