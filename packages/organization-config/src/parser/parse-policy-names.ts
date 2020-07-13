import { PolicyName } from "aws-sdk/clients/organizations"

export const parsePolicyNames = (value: any): PolicyName[] => {
  if (value === null || value === undefined) {
    return []
  }

  if (typeof value === "string") {
    return [value]
  }

  return value
}
