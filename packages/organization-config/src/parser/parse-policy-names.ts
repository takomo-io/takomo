import { OrganizationPolicyName } from "@takomo/aws-model"

export const parsePolicyNames = (
  value: any,
): ReadonlyArray<OrganizationPolicyName> => {
  if (value === null || value === undefined) {
    return []
  }

  if (typeof value === "string") {
    return [value]
  }

  return value
}
