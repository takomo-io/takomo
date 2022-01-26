import { SSM } from "@aws-sdk/client-ssm"
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
  const { withClient } = createClient({
    ...props,
    clientConstructor: (configuration) => new SSM(configuration),
  })

  const getParameterValue = (name: string): Promise<string> =>
    withClient((c) =>
      c
        .getParameter({ Name: name, WithDecryption: true })
        .then((r) => r.Parameter!.Value!),
    )

  return {
    getParameterValue,
  }
}
