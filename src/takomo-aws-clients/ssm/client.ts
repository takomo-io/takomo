import { SSM } from "@aws-sdk/client-ssm"
import { InternalAwsClientProps } from "../common/client"
import { customRequestHandler } from "../common/request-handler"
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
    requestHandler: customRequestHandler(25),
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
