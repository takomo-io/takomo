import { OrganizationPolicyName } from "@takomo/aws-model"

export const DEFAULT_ORGANIZATION_ROLE_NAME = "OrganizationAccountAccessRole"
export const DEFAULT_SERVICE_CONTROL_POLICY_NAME = "FullAWSAccess"

export type OrganizationalUnitPath = string
export type OrganizationAccountStatus = "active" | "disabled" | "suspended"
export type OrganizationalUnitStatus = "active" | "disabled"

type AccountDescription = string

export interface AccountState {
  readonly serviceControlPolicies?: PoliciesState
  readonly tagPolicies?: PoliciesState
  readonly backupPolicies?: PoliciesState
  readonly aiServicesOptOutPolicies?: PoliciesState
}

export interface PoliciesState {
  readonly inherited?: ReadonlyArray<OrganizationPolicyName>
  readonly attached?: ReadonlyArray<OrganizationPolicyName>
}

export interface OrganizationalUnitState {
  readonly accounts?: Record<AccountDescription, AccountState>
  readonly serviceControlPolicies?: PoliciesState
  readonly tagPolicies?: PoliciesState
  readonly backupPolicies?: PoliciesState
  readonly aiServicesOptOutPolicies?: PoliciesState
}

export type OrganizationHierarchyState = Record<
  OrganizationalUnitPath,
  OrganizationalUnitState
>
