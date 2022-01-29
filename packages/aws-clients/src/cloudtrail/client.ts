import { CloudTrail } from "@aws-sdk/client-cloudtrail"
import { CloudTrailEvent } from "@takomo/aws-model"
import { AwsClientProps, pagedOperation } from "../common/client"
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
  props: AwsClientProps,
): CloudTrailClient => {
  const client = new CloudTrail({
    region: props.region,
    credentials: props.credentialProvider,
    retryStrategy: customRetryStrategy(),
  })

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
