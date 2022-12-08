import { CloudTrail } from "@aws-sdk/client-cloudtrail"
import { InternalAwsClientProps, pagedOperation } from "../common/client"
import { customRequestHandler } from "../common/request-handler"
import { customRetryStrategy } from "../common/retry"
import { convertCloudTrailEvents } from "./convert"
import { CloudTrailEvent } from "./model"

export interface CloudTrailClient {
  readonly lookupEvents: (
    startTime: Date,
    endTime: Date,
  ) => Promise<ReadonlyArray<CloudTrailEvent>>
}

export const createCloudTrailClient = (
  props: InternalAwsClientProps,
): CloudTrailClient => {
  const client = new CloudTrail({
    region: props.region,
    credentials: props.credentialProvider,
    retryStrategy: customRetryStrategy(),
    requestHandler: customRequestHandler(25),
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
