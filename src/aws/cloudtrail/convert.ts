import { LookupEventsResponse } from "@aws-sdk/client-cloudtrail"
import { CloudTrailEvent } from "./model"

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
