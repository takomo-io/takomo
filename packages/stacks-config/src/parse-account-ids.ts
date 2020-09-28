import { AccountId } from "@takomo/core"

export const parseAccountIds = (value: any): AccountId[] | null => {
  if (value === null || value === undefined) {
    return null
  }

  return Array.isArray(value)
    ? value.map((a) => a.toString())
    : [value.toString()]
}
