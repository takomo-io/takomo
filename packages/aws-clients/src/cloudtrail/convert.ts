/**
 * @hidden
 */
import { CloudTrailEvent } from "@takomo/aws-model"
import { LookupEventsResponse } from "aws-sdk/clients/cloudtrail"

export const convertCloudTrailEvents = ({
  Events,
}: LookupEventsResponse): ReadonlyArray<CloudTrailEvent> =>
  (Events ?? []).map((e) => ({
    cloudTrailEvent: JSON.parse(e.CloudTrailEvent!),
    eventId: e.EventId!,
    eventName: e.EventName!,
    username: e.Username!,
    eventSource: e.EventSource!,
    eventTime: e.EventTime!,
  }))
