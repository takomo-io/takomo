import {
  AccountId,
  OrganizationalUnitId,
  OrganizationalUnitName,
  OrganizationPolicyName,
} from "@takomo/aws-model"
import { OrganizationalUnitPath } from "@takomo/organization-model"

export interface PlannedOrganizationalUnit extends PlannedOrgEntity {
  readonly path: OrganizationalUnitPath
  readonly priority: number
  readonly name: OrganizationalUnitName
  readonly id: OrganizationalUnitId | null
  readonly parentId: OrganizationalUnitId | null
  readonly operation: string
  readonly children: ReadonlyArray<PlannedOrganizationalUnit>
  readonly accounts: PlannedAccounts
}

export interface OrgEntityPolicyOperations {
  readonly retain: ReadonlyArray<OrganizationPolicyName>
  readonly add: ReadonlyArray<OrganizationPolicyName>
  readonly remove: ReadonlyArray<OrganizationPolicyName>
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
  readonly retain: ReadonlyArray<PlannedAccount>
  readonly add: ReadonlyArray<PlannedAccount>
  readonly remove: ReadonlyArray<PlannedAccount>
}

export interface OrganizationalUnitsDeploymentPlan {
  readonly hasChanges: boolean
  readonly root: PlannedOrganizationalUnit
}
