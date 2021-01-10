import { OrganizationPolicyType } from "@takomo/aws-model"
import { OrganizationPoliciesConfig } from "../model"
import { parsePolicies } from "./parse-policies"

export const parsePoliciesConfig = (
  policyType: OrganizationPolicyType,
  value: any,
): OrganizationPoliciesConfig => {
  if (value === null || value === undefined) {
    return {
      policyType,
      enabled: false,
      policies: [],
    }
  }

  if (typeof value === "boolean") {
    return {
      policyType,
      enabled: value,
      policies: [],
    }
  }

  return {
    policyType,
    enabled: true,
    policies: parsePolicies(value),
  }
}
