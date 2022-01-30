import { CloudTrail } from "@aws-sdk/client-cloudtrail"
import { CloudTrailEvent } from "@takomo/aws-model"
import { InternalAwsClientProps, pagedOperation } from "../common/client"
import { customLogger } from "../common/logger"
import { customRetryStrategy } from "../common/retry"
import { convertCloudTrailEvents } from "./convert"

/**
 * @hidden
 */
export interface CloudTrailClient {
  readonly lookupEvents: (
    startTime: Date,
    endTime: Date,
  ) => Promise<ReadonlyArray<CloudTrailEvent>>
}

/**
 * @hidden
 */
export const createCloudTrailClient = (
  props: InternalAwsClientProps,
): CloudTrailClient => {
  const client = new CloudTrail({
    region: props.region,
    credentials: props.credentialProvider,
    retryStrategy: customRetryStrategy(),
    logger: customLogger(props.logger),
  })

  client.middlewareStack.use(props.middleware)

  const lookupEvents = (
    startTime: Date,
    endTime: Date,
  ): Promise<ReadonlyArray<CloudTrailEvent>> =>
    pagedOperation(
      (params) => client.lookupEvents(params),
      { StartTime: startTime, EndTime: endTime },
      convertCloudTrailEvents,
    )

  return { lookupEvents }
}
