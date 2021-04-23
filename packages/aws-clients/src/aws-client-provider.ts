import { Region } from "@takomo/aws-model"
import { TkmLogger } from "@takomo/util"
import { IPolicy, Policy } from "cockatiel"
import {
  CloudFormationClient,
  createCloudFormationClient,
} from "./cloudformation/client"
import { CloudTrailClient, createCloudTrailClient } from "./cloudtrail/client"
import { ApiCallProps, AwsClientProps } from "./common/client"
import { createIamClient, IamClient } from "./iam/client"
import {
  createOrganizationsClient,
  OrganizationsClient,
} from "./organizations/client"
import { createRamClient, RamClient } from "./ram/client"
import { createS3Client, S3Client } from "./s3/client"
import { createStsClient, StsClient } from "./sts/client"

export interface AwsClientProvider {
  readonly createCloudFormationClient: (
    props: AwsClientProps,
  ) => CloudFormationClient

  readonly createCloudTrailClient: (props: AwsClientProps) => CloudTrailClient

  readonly createIamClient: (props: AwsClientProps) => IamClient

  readonly createOrganizationsClient: (
    props: AwsClientProps,
  ) => OrganizationsClient

  readonly createRamClient: (props: AwsClientProps) => RamClient

  readonly createS3Client: (props: AwsClientProps) => S3Client
  readonly createStsClient: (props: AwsClientProps) => StsClient
}

/**
 * @hidden
 */
export interface InternalAwsClientProvider extends AwsClientProvider {
  readonly getCloudFormationClients: () => Map<string, CloudFormationClient>
  readonly getApiCalls: () => ReadonlyArray<ApiCallProps>
  readonly getRegions: () => ReadonlyArray<Region>
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
  const regions = new Set<Region>()
  const describeEventsBulkhead = createDescribeEventsBulkhead()

  const listener = {
    onApiCall: (props: ApiCallProps): void => {
      apiCalls.push(props)
    },
  }

  return {
    getCloudFormationClients: (): Map<string, CloudFormationClient> =>
      new Map(cloudFormationClients),
    getRegions: (): ReadonlyArray<Region> => Array.from(regions),
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

      regions.add(props.region)

      return client
    },
    createCloudTrailClient: (props: AwsClientProps): CloudTrailClient => {
      const client = createCloudTrailClient({ ...props, listener })
      regions.add(props.region)
      return client
    },
    createIamClient: (props: AwsClientProps): IamClient => {
      const client = createIamClient({ ...props, listener })
      regions.add(props.region)
      return client
    },
    createOrganizationsClient: (props: AwsClientProps): OrganizationsClient => {
      const client = createOrganizationsClient({ ...props, listener })
      regions.add(props.region)
      return client
    },
    createRamClient: (props: AwsClientProps): RamClient => {
      const client = createRamClient({ ...props, listener })
      regions.add(props.region)
      return client
    },
    createS3Client: (props: AwsClientProps): S3Client => {
      const client = createS3Client({ ...props, listener })
      regions.add(props.region)
      return client
    },
    createStsClient: (props: AwsClientProps): StsClient => {
      const client = createStsClient({ ...props, listener })
      regions.add(props.region)
      return client
    },
  }
}
