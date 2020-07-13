import { ConfigSetName } from "@takomo/config-sets"

export const parseConfigSetNames = (value: any): ConfigSetName[] => {
  if (value === null || value === undefined) {
    return []
  }

  if (typeof value === "string") {
    return [value]
  }

  return value
}
