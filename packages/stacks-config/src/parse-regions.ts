import { Region } from "@takomo/aws-model"

export const parseRegions = (value: any): ReadonlyArray<Region> => {
  if (value === null || value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}
