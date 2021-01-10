import {
  OrganizationPolicyContent,
  OrganizationPolicyDescription,
  OrganizationPolicyId,
  OrganizationPolicyName,
  OrganizationPolicyType,
} from "@takomo/aws-model"

export interface PlannedPolicy {
  readonly name: OrganizationPolicyName
  readonly type: OrganizationPolicyType
  readonly id: OrganizationPolicyId | null
  readonly awsManaged: boolean
  readonly currentDescription: OrganizationPolicyDescription | null
  readonly newDescription: OrganizationPolicyDescription | null
  readonly newContent: OrganizationPolicyContent | null
  readonly currentContent: OrganizationPolicyContent | null
}

export interface PolicyOperations {
  readonly add: ReadonlyArray<PlannedPolicy>
  readonly update: ReadonlyArray<PlannedPolicy>
  readonly remove: ReadonlyArray<PlannedPolicy>
  readonly skip: ReadonlyArray<PlannedPolicy>
}

export interface PolicyDeploymentPlan {
  readonly skip: boolean
  readonly hasChanges: boolean
  readonly serviceControl: PolicyOperations
  readonly tag: PolicyOperations
  readonly aiServicesOptOut: PolicyOperations
  readonly backup: PolicyOperations
}
