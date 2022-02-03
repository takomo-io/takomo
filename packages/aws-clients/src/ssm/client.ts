import { SSM } from "@aws-sdk/client-ssm"
import { InternalAwsClientProps } from "../common/client"
import { customLogger } from "../common/logger"
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
export const createSsmClient = (props: InternalAwsClientProps): SsmClient => {
  const client = new SSM({
    region: props.region,
    credentials: props.credentialProvider,
    retryStrategy: customRetryStrategy(),
    logger: customLogger(props.logger),
  })

  client.middlewareStack.use(props.middleware)

  const getParameterValue = (name: string): Promise<string> =>
    client
      .getParameter({ Name: name, WithDecryption: true })
      .then((r) => r.Parameter!.Value!)

  return {
    getParameterValue,
  }
}
