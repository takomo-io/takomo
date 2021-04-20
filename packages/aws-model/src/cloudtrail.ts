export interface CloudTrailEvent {
  eventId: string
  eventName: string
  eventTime: Date
  eventSource: string
  username: string
  cloudTrailEvent: Record<string, any>
}
