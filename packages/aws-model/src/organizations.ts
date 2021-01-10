import { AccountArn, AccountEmail, AccountId, AccountName, Arn } from "./common"

export type OrganizationFeatureSet = "ALL" | "CONSOLIDATED_BILLING"
export type OrganizationId = string
export type OrganizationArn = string

export interface Organization {
  readonly id: OrganizationId
  readonly arn: OrganizationArn
  readonly featureSet: OrganizationFeatureSet
  readonly masterAccountArn: AccountArn
  readonly masterAccountId: AccountId
  readonly masterAccountEmail: AccountEmail
}

export type AccountStatus = "ACTIVE" | "SUSPENDED"

export interface OrganizationAccount {
  readonly id: AccountId
  readonly arn: AccountArn
  readonly email: AccountEmail
  readonly name: AccountName
  readonly status: AccountStatus
  readonly joinedTimestamp: Date
}

export type OrganizationPolicyId = string
export type OrganizationPolicyArn = string
export type OrganizationPolicyName = string
export type OrganizationPolicyDescription = string
export type OrganizationPolicyType =
  | "SERVICE_CONTROL_POLICY"
  | "TAG_POLICY"
  | "BACKUP_POLICY"
  | "AISERVICES_OPT_OUT_POLICY"

export type OrganizationPolicyContent = string

export interface OrganizationPolicySummary {
  readonly id: OrganizationPolicyId
  readonly arn: OrganizationPolicyArn
  readonly name: OrganizationPolicyName
  readonly description: OrganizationPolicyDescription
  readonly type: OrganizationPolicyType
  readonly awsManaged: boolean
}

export interface OrganizationPolicy {
  readonly summary: OrganizationPolicySummary
  readonly content: OrganizationPolicyContent
}

export type OrganizationPolicyTargetId = string
export type OrganizationPolicyTargetName = string
export type OrganizationPolicyTargetType =
  | "ACCOUNT"
  | "ORGANIZATIONAL_UNIT"
  | "ROOT"

export interface OrganizationPolicyTargetSummary {
  readonly targetId: OrganizationPolicyTargetId
  readonly arn: Arn
  readonly name: OrganizationPolicyTargetName
  readonly type: OrganizationPolicyTargetType
}

export type OrganizationalUnitArn = string
export type OrganizationalUnitId = string
export type OrganizationalUnitName = string

export interface OrganizationalUnit {
  readonly id: OrganizationalUnitId
  readonly arn: OrganizationalUnitArn
  readonly name: OrganizationalUnitName
}

export type OrganizationRootId = string
export type OrganizationRootArn = string
export type OrganizationRootName = string

export interface OrganizationRoot {
  readonly id: OrganizationRootId
  readonly arn: OrganizationRootArn
  readonly name: OrganizationRootName
  readonly policyTypes: ReadonlyArray<OrganizationPolicyTypeSummary>
}

export type OrganizationPolicyTypeStatus =
  | "ENABLED"
  | "PENDING_ENABLE"
  | "PENDING_DISABLE"

export interface OrganizationPolicyTypeSummary {
  readonly type: OrganizationPolicyType
  readonly status: OrganizationPolicyTypeStatus
}

export interface DetailedOrganizationalUnit {
  readonly ou: OrganizationalUnit
  readonly accounts: ReadonlyArray<OrganizationAccount>
  readonly children: ReadonlyArray<DetailedOrganizationalUnit>
}

export interface DetailedOrganizationPolicy {
  readonly policy: OrganizationPolicy
  readonly targets: ReadonlyArray<OrganizationPolicyTargetSummary>
}
