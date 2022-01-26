import { STS } from "@aws-sdk/client-sts"
import { CallerIdentity } from "@takomo/aws-model"
import { AwsClientProps, createClient } from "../common/client"

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
  const { withClient } = createClient({
    ...props,
    clientConstructor: (config) => new STS(config),
  })

  const getCallerIdentity = (): Promise<CallerIdentity> =>
    withClient((c) =>
      c.getCallerIdentity({}).then((res) => ({
        accountId: res.Account!,
        arn: res.Arn!,
        userId: res.UserId!,
      })),
    )

  return {
    getCallerIdentity,
  }
}
