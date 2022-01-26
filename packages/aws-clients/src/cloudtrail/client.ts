import { CloudTrail } from "@aws-sdk/client-cloudtrail"
import { CloudTrailEvent } from "@takomo/aws-model"
import { AwsClientProps, createClient } from "../common/client"
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
  const { pagedOperation, withClient } = createClient({
    ...props,
    clientConstructor: (configuration) => new CloudTrail(configuration),
  })

  const lookupEvents = (
    startTime: Date,
    endTime: Date,
  ): Promise<ReadonlyArray<CloudTrailEvent>> =>
    withClient((c) =>
      pagedOperation(
        (params) => c.lookupEvents(params),
        { StartTime: startTime, EndTime: endTime },
        convertCloudTrailEvents,
      ),
    )

  return { lookupEvents }
}
