import { OutputFormat } from "@takomo/core"

export const parseOutputFormat = (format?: string): OutputFormat => {
  if (!format) {
    return "text"
  }

  switch (format) {
    case "text":
      return "text"
    case "yaml":
      return "yaml"
    case "json":
      return "json"
    default:
      return "text"
  }
}
