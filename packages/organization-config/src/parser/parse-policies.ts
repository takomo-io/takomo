import { OrganizationPolicyConfig } from "../model"

export const parsePolicies = (value: any): OrganizationPolicyConfig[] => {
  if (!value) {
    return []
  }
  return Object.keys(value).map((policyName) => ({
    name: policyName,
    description: value[policyName].description,
    awsManaged: value[policyName].awsManaged === true,
  }))
}
