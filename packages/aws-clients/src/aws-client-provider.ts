import {
  CloudFormationClient,
  createCloudFormationClient,
} from "./cloudformation/client"
import { ApiCallProps, AwsClientProps } from "./common/client"

export interface AwsClientProvider {
  readonly createCloudFormationClient: (
    props: AwsClientProps,
  ) => CloudFormationClient
}

/**
 * @hidden
 */
export interface InternalAwsClientProvider extends AwsClientProvider {
  readonly getCloudFormationClients: () => Map<string, CloudFormationClient>
  readonly getApiCalls: () => ReadonlyArray<ApiCallProps>
}

/**
 * @hidden
 */
export const createAwsClientProvider = (): InternalAwsClientProvider => {
  const cloudFormationClients = new Map<string, CloudFormationClient>()
  const apiCalls = new Array<ApiCallProps>()

  const listener = {
    onApiCall: (props: ApiCallProps): void => {
      apiCalls.push(props)
    },
  }

  return {
    getCloudFormationClients: (): Map<string, CloudFormationClient> =>
      new Map(cloudFormationClients),
    getApiCalls: (): ReadonlyArray<ApiCallProps> => apiCalls.slice(),
    createCloudFormationClient: (
      props: AwsClientProps,
    ): CloudFormationClient => {
      const client = createCloudFormationClient({ listener, ...props })
      cloudFormationClients.set(props.id, client)
      return client
    },
  }
}
