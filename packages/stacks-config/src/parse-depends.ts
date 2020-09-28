import { StackPath } from "@takomo/core"

export const parseDepends = (value: any): StackPath[] => {
  if (value === null || value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}
