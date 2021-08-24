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
import { createS3Client, S3Client } from "./s3/client"
import { createSsmClient, SsmClient } from "./ssm/client"
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

  readonly createS3Client: (props: AwsClientProps) => S3Client
  readonly createStsClient: (props: AwsClientProps) => StsClient
  readonly createSsmClient: (props: AwsClientProps) => SsmClient
}

/**
 * @hidden
 */
export interface InternalAwsClientProvider extends AwsClientProvider {
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

const createGetTemplateSummaryBulkhead = (): IPolicy => {
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
  const apiCalls = new Array<ApiCallProps>()
  const regions = new Set<Region>()
  const describeEventsBulkhead = createDescribeEventsBulkhead()
  const getTemplateSummaryBulkhead = createGetTemplateSummaryBulkhead()

  const listener = {
    onApiCall: (props: ApiCallProps): void => {
      apiCalls.push(props)
    },
  }

  return {
    getRegions: (): ReadonlyArray<Region> => Array.from(regions),
    getApiCalls: (): ReadonlyArray<ApiCallProps> => apiCalls.slice(),
    createCloudFormationClient: (
      props: AwsClientProps,
    ): CloudFormationClient => {
      const client = createCloudFormationClient({
        listener,
        ...props,
        describeEventsBulkhead,
        getTemplateSummaryBulkhead,
        waitStackDeployToCompletePollInterval: 2000,
        waitStackDeleteToCompletePollInterval: 2000,
      })

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
    createSsmClient: (props: AwsClientProps): SsmClient => {
      const client = createSsmClient({ ...props, listener })
      regions.add(props.region)
      return client
    },
  }
}
