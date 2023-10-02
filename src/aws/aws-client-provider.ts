import { IPolicy, Policy } from "cockatiel"
import { TkmLogger } from "../utils/logging.js"
import { createScheduler, Scheduler } from "../utils/scheduler.js"
import { checksum } from "../utils/strings.js"
import {
  CloudFormationClient,
  createCloudFormationClient,
} from "./cloudformation/client.js"
import {
  CloudTrailClient,
  createCloudTrailClient,
} from "./cloudtrail/client.js"
import {
  ApiCallProps,
  AwsClientProps,
  CloudFormationClientProps,
} from "./common/client.js"
import { CallerIdentity, Region } from "./common/model.js"
import {
  createOrganizationsClient,
  OrganizationsClient,
} from "./organizations/client.js"
import { createS3Client, S3Client } from "./s3/client.js"
import { createStsClient, StsClient } from "./sts/client.js"

const makeIdentityRegionHash = (
  region: Region,
  identity: CallerIdentity,
): string => checksum([region, identity.accountId].join(":"))

export interface AwsClientProvider {
  readonly createCloudFormationClient: (
    props: CloudFormationClientProps,
  ) => Promise<CloudFormationClient>
  readonly createCloudTrailClient: (
    props: AwsClientProps,
  ) => Promise<CloudTrailClient>
  readonly createS3Client: (props: AwsClientProps) => Promise<S3Client>
  readonly createStsClient: (props: AwsClientProps) => Promise<StsClient>
  readonly createOrganizationsClient: (
    props: AwsClientProps,
  ) => Promise<OrganizationsClient>
}

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

const createGetTemplateSummaryScheduler = (logger: TkmLogger): Scheduler =>
  createScheduler({
    logger,
    id: "GetTemplateSummary",
    intervalCap: 2,
    concurrency: 5,
    intervalInMillis: 200,
  })

const createValidateTemplateBulkhead = (): IPolicy => {
  const limit = 4
  const queue = 1000
  return Policy.bulkhead(limit, queue)
}

interface ConcurrencyControls {
  readonly describeEventsBulkhead: IPolicy
  readonly getTemplateSummaryScheduler: Scheduler
  readonly validateTemplateBulkhead: IPolicy
}

export const createAwsClientProvider = ({
  logger,
}: AwsClientProviderProps): InternalAwsClientProvider => {
  const apiCalls = new Array<ApiCallProps>()
  const regions = new Set<Region>()

  const concurrencyControls = new Map<string, ConcurrencyControls>()

  const getConcurrencyControls = (key: string): ConcurrencyControls => {
    if (concurrencyControls.has(key)) {
      return concurrencyControls.get(key)!
    }

    const controls = {
      describeEventsBulkhead: createDescribeEventsBulkhead(),
      getTemplateSummaryScheduler: createGetTemplateSummaryScheduler(logger),
      validateTemplateBulkhead: createValidateTemplateBulkhead(),
    }

    concurrencyControls.set(key, controls)

    return controls
  }

  const listener = {
    onApiCall: (props: ApiCallProps): void => {
      apiCalls.push(props)
    },
  }

  return {
    getRegions: (): ReadonlyArray<Region> => Array.from(regions),
    getApiCalls: (): ReadonlyArray<ApiCallProps> => apiCalls.slice(),
    createCloudFormationClient: async (
      props: CloudFormationClientProps,
    ): Promise<CloudFormationClient> => {
      const hash = makeIdentityRegionHash(props.region, props.identity)
      const controls = getConcurrencyControls(hash)

      const client = createCloudFormationClient({
        ...props,
        ...controls,
        waitStackDeployToCompletePollInterval: 2000,
        waitStackDeleteToCompletePollInterval: 2000,
        waitStackRollbackToCompletePollInterval: 2000,
        listener,
      })

      regions.add(props.region)

      return client
    },
    createCloudTrailClient: async (
      props: AwsClientProps,
    ): Promise<CloudTrailClient> => {
      const client = createCloudTrailClient({
        ...props,
        listener,
      })
      regions.add(props.region)
      return client
    },
    createS3Client: async (props: AwsClientProps): Promise<S3Client> => {
      const client = createS3Client({
        ...props,
        listener,
      })
      regions.add(props.region)
      return client
    },
    createStsClient: async (props: AwsClientProps): Promise<StsClient> => {
      const client = createStsClient({
        ...props,
        listener,
      })
      regions.add(props.region)
      return client
    },
    createOrganizationsClient: async (
      props: AwsClientProps,
    ): Promise<OrganizationsClient> => {
      const client = createOrganizationsClient({
        ...props,
        listener,
      })
      regions.add(props.region)
      return client
    },
  }
}
