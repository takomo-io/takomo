import { TkmLogger } from "@takomo/util"
import { IPolicy, Policy } from "cockatiel"
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

interface AwsClientProviderProps {
  readonly logger: TkmLogger
}

const createDescribeEventsBulkhead = (): IPolicy => {
  const limit = 2
  const queue = 1000
  return Policy.bulkhead(limit, queue)
}

/**
 * @hidden
 */
export const createAwsClientProvider = (
  props: AwsClientProviderProps,
): InternalAwsClientProvider => {
  const cloudFormationClients = new Map<string, CloudFormationClient>()
  const apiCalls = new Array<ApiCallProps>()
  const describeEventsBulkhead = createDescribeEventsBulkhead()

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
      const client = createCloudFormationClient({
        listener,
        ...props,
        describeEventsBulkhead,
        waitStackDeployToCompletePollInterval: 2000,
        waitStackDeleteToCompletePollInterval: 2000,
      })
      cloudFormationClients.set(props.id, client)
      return client
    },
  }
}
