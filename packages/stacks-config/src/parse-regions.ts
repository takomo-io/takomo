import { Region } from "@takomo/core"

export const parseRegions = (value: any): Region[] => {
  if (value === null || value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}
