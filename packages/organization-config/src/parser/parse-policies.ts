import { OrganizationPolicyConfig } from "../model"

export const parsePolicies = (
  value: any,
): ReadonlyArray<OrganizationPolicyConfig> => {
  if (!value) {
    return []
  }
  return Object.keys(value).map((policyName) => ({
    name: policyName,
    description: value[policyName].description,
    awsManaged: value[policyName].awsManaged === true,
    dynamic: value[policyName].dynamic !== false,
  }))
}
