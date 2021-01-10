import { AccountId } from "@takomo/aws-model"

export const parseAccountIds = (value: any): AccountId[] => {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}
