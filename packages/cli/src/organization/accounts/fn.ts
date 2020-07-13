import { AccountId } from "@takomo/core"

export const parseAccountIds = (value: any): AccountId[] => {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}
