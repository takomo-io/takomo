import { OrganizationPolicyType, ServicePrincipal } from "@takomo/aws-model"

export interface OrganizationTrustedServicesPlan {
  readonly add: ReadonlyArray<ServicePrincipal>
  readonly retain: ReadonlyArray<ServicePrincipal>
  readonly remove: ReadonlyArray<ServicePrincipal>
}

export interface EnabledPoliciesPlan {
  readonly add: ReadonlyArray<OrganizationPolicyType>
  readonly retain: ReadonlyArray<OrganizationPolicyType>
  readonly remove: ReadonlyArray<OrganizationPolicyType>
}

export interface OrganizationBasicConfigDeploymentPlan {
  readonly skip: boolean
  readonly hasChanges: boolean
  readonly trustedServices: OrganizationTrustedServicesPlan
  readonly enabledPolicies: EnabledPoliciesPlan
}
