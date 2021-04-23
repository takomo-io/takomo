import { CallerIdentity } from "@takomo/aws-model"
import { STS } from "aws-sdk"
import { AwsClientProps, createClient } from "../common/client"

/**
 * @hidden
 */
export interface StsClient {
  getCallerIdentity: () => Promise<CallerIdentity>
}

/**
 * @hidden
 */
export const createStsClient = (props: AwsClientProps): StsClient => {
  const { withClientPromise } = createClient({
    ...props,
    clientConstructor: (config) => new STS(config),
  })

  const getCallerIdentity = (): Promise<CallerIdentity> =>
    withClientPromise(
      (c) => c.getCallerIdentity({}),
      (res) => ({
        accountId: res.Account!,
        arn: res.Arn!,
        userId: res.UserId!,
      }),
    )

  return {
    getCallerIdentity,
  }
}
