import { AccountId } from "../../aws/common/model.js"

export const parseAccountIds = (
  value: any,
): ReadonlyArray<AccountId> | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  return Array.isArray(value)
    ? value.map((a) => a.toString())
    : [value.toString()]
}
