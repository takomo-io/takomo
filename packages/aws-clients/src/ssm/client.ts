import { SSM } from "aws-sdk"
import { AwsClientProps, createClient } from "../common/client"

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
  const { withClientPromise } = createClient({
    ...props,
    clientConstructor: (configuration) => new SSM(configuration),
  })

  const getParameterValue = (name: string): Promise<string> =>
    withClientPromise(
      (c) => c.getParameter({ Name: name, WithDecryption: true }),
      (r) => r.Parameter!.Value!,
    )

  return {
    getParameterValue,
  }
}
