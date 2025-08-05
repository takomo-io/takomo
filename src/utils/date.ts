import { format } from "date-and-time"

export const formatTimestamp = (date: Date): string =>
  format(date, "YYYY-MM-DD HH:mm:ss Z")
