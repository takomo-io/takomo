import { StackPath } from "@takomo/stacks-model"

export const parseDepends = (value: any): ReadonlyArray<StackPath> => {
  if (value === null || value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}
