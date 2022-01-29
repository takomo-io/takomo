import { SSM } from "@aws-sdk/client-ssm"
import { AwsClientProps } from "../common/client"
import { customRetryStrategy } from "../common/retry"

/**
 * @hidden
 */
export interface SsmClient {
  readonly getParameterValue: (name: string) => Promise<string>
}

/**
 * @hidden
 */
export const createSsmClient = (props: AwsClientProps): SsmClient => {
  const client = new SSM({
    region: props.region,
    credentials: props.credentialProvider,
    retryStrategy: customRetryStrategy(),
  })

  const getParameterValue = (name: string): Promise<string> =>
    client
      .getParameter({ Name: name, WithDecryption: true })
      .then((r) => r.Parameter!.Value!)

  return {
    getParameterValue,
  }
}
