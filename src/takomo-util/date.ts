import _date from "date-and-time"

export const formatTimestamp = (date: Date): string =>
  _date.format(date, "YYYY-MM-DD HH:mm:ss Z")
