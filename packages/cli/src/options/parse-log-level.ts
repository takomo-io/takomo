import { LogLevel } from "@takomo/util"

export const parseLogLevel = (log: string, quiet: boolean): LogLevel => {
  if (quiet) {
    return "none"
  }

  switch (log) {
    case "trace":
      return "trace"
    case "debug":
      return "debug"
    case "info":
      return "info"
    case "warn":
      return "warn"
    case "error":
      return "error"
    case "none":
      return "none"
    default:
      return "info"
  }
}
