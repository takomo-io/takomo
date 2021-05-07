import { OrganizationPolicyType } from "@takomo/aws-model"

export interface EnabledPoliciesPlan {
  readonly add: ReadonlyArray<OrganizationPolicyType>
  readonly retain: ReadonlyArray<OrganizationPolicyType>
  readonly remove: ReadonlyArray<OrganizationPolicyType>
}

export interface OrganizationBasicConfigDeploymentPlan {
  readonly skip: boolean
  readonly hasChanges: boolean
  readonly enabledPolicies: EnabledPoliciesPlan
}
