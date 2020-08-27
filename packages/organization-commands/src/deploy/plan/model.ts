import { AccountId } from "@takomo/core"
import { OrganizationalUnitPath } from "@takomo/organization-config"
import {
  OrganizationalUnitId,
  OrganizationalUnitName,
  PolicyContent,
  PolicyDescription,
  PolicyId,
  PolicyName,
  PolicyType,
} from "aws-sdk/clients/organizations"

export interface OrgEntityPolicyOperations {
  readonly retain: PolicyName[]
  readonly add: PolicyName[]
  readonly remove: PolicyName[]
}

export interface OrgEntityPolicyOperationsPlan {
  readonly attached: OrgEntityPolicyOperations
  readonly inherited: OrgEntityPolicyOperations
}

export interface OrgEntityPoliciesPlan {
  readonly hasChanges: boolean
  readonly serviceControl: OrgEntityPolicyOperationsPlan
  readonly tag: OrgEntityPolicyOperationsPlan
  readonly aiServicesOptOut: OrgEntityPolicyOperationsPlan
  readonly backup: OrgEntityPolicyOperationsPlan
}

export interface PlannedOrgEntity {
  readonly policies: OrgEntityPoliciesPlan
}

export interface PlannedAccount extends PlannedOrgEntity {
  readonly id: AccountId
  readonly operation: string
}

export interface PlannedAccounts {
  readonly retain: PlannedAccount[]
  readonly add: PlannedAccount[]
  readonly remove: PlannedAccount[]
}

export interface PlannedOrganizationalUnit extends PlannedOrgEntity {
  readonly path: OrganizationalUnitPath
  readonly priority: number
  readonly name: OrganizationalUnitName
  readonly id: OrganizationalUnitId | null
  readonly parentId: OrganizationalUnitId | null
  readonly operation: string
  readonly children: PlannedOrganizationalUnit[]
  readonly accounts: PlannedAccounts
}

export interface PlannedPolicy {
  readonly name: PolicyName
  readonly type: PolicyType
  readonly id: PolicyId | null
  readonly awsManaged: boolean
  readonly currentDescription: PolicyDescription | null
  readonly newDescription: PolicyDescription | null
  readonly newContent: PolicyContent | null
  readonly currentContent: PolicyContent | null
}

export interface PolicyOperations {
  readonly add: PlannedPolicy[]
  readonly update: PlannedPolicy[]
  readonly remove: PlannedPolicy[]
  readonly skip: PlannedPolicy[]
}

export interface PolicyDeploymentPlan {
  readonly skip: boolean
  readonly hasChanges: boolean
  readonly serviceControl: PolicyOperations
  readonly tag: PolicyOperations
  readonly aiServicesOptOut: PolicyOperations
  readonly backup: PolicyOperations
}

export interface OrganizationalUnitsDeploymentPlan {
  readonly hasChanges: boolean
  readonly root: PlannedOrganizationalUnit
}

export interface OrganizationTrustedServicesPlan {
  readonly add: string[]
  readonly retain: string[]
  readonly remove: string[]
}

export interface EnabledPoliciesPlan {
  readonly add: PolicyType[]
  readonly retain: PolicyType[]
  readonly remove: PolicyType[]
}

export interface OrganizationBasicConfigDeploymentPlan {
  readonly skip: boolean
  readonly hasChanges: boolean
  readonly trustedServices: OrganizationTrustedServicesPlan
  readonly enabledPolicies: EnabledPoliciesPlan
}

export interface OrganizationLaunchPlan {
  readonly policiesPlan: PolicyDeploymentPlan
  readonly organizationalUnitsPlan: OrganizationalUnitsDeploymentPlan
  readonly organizationBasicConfigPlan: OrganizationBasicConfigDeploymentPlan
  readonly hasChanges: boolean
}
