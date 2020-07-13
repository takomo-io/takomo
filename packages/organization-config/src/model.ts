import { ConfigSet, ConfigSetName } from "@takomo/config-sets"
import { AccountId } from "@takomo/core"
import {
  OrganizationalUnitName,
  PolicyName,
  PolicyType,
} from "aws-sdk/clients/organizations"

export type OrganizationalUnitPath = string

export enum OrganizationAccountStatus {
  ACTIVE = "active",
  DISABLED = "disabled",
  SUSPENDED = "suspended",
}

export enum OrganizationalUnitStatus {
  ACTIVE = "active",
  DISABLED = "disabled",
}

export interface NewAccountDefaults {
  readonly iamUserAccessToBilling: boolean
  readonly roleName: string
}

export interface NewAccountConstraints {
  readonly emailPattern: RegExp | null
  readonly namePattern: RegExp | null
}

export interface AccountCreationConfig {
  readonly defaults: NewAccountDefaults
  readonly constraints: NewAccountConstraints
}

export interface OrganizationPolicyConfig {
  readonly name: string
  readonly awsManaged: boolean
  readonly description: string
}

export interface OrganizationPoliciesConfig {
  readonly enabled: boolean
  readonly policyType: PolicyType
  readonly policies: OrganizationPolicyConfig[]
}

export interface OrgEntityPolicies {
  readonly attached: PolicyName[]
  readonly inherited: PolicyName[]
}

export interface OrgEntityPoliciesConfig {
  readonly serviceControl: OrgEntityPolicies
  readonly tag: OrgEntityPolicies
  readonly aiServicesOptOut: OrgEntityPolicies
  readonly backup: OrgEntityPolicies
}

export interface OrgEntity {
  readonly policies: OrgEntityPoliciesConfig
  readonly vars: any
  readonly configSets: ConfigSetName[]
  readonly bootstrapConfigSets: ConfigSetName[]
  readonly accountAdminRoleName: string | null
  readonly accountBootstrapRoleName: string | null
  readonly description: string | null
}

export interface OrganizationAccount extends OrgEntity {
  readonly id: AccountId
  readonly name: string | null
  readonly email: string | null
  readonly status: OrganizationAccountStatus
}

export interface OrganizationalUnit extends OrgEntity {
  readonly name: OrganizationalUnitName
  readonly path: OrganizationalUnitPath
  readonly priority: number
  readonly status: OrganizationalUnitStatus
  readonly accounts: OrganizationAccount[]
  readonly children: OrganizationalUnit[]
}

export interface OrganizationalUnitsConfig {
  readonly Root: OrganizationalUnit
}

export interface OrganizationConfigFile {
  readonly masterAccountId: AccountId
  readonly accountCreation: AccountCreationConfig
  readonly configSets: ConfigSet[]
  readonly vars: any
  readonly serviceControlPolicies: OrganizationPoliciesConfig
  readonly tagPolicies: OrganizationPoliciesConfig
  readonly aiServicesOptOutPolicies: OrganizationPoliciesConfig
  readonly backupPolicies: OrganizationPoliciesConfig
  readonly organizationalUnits: OrganizationalUnitsConfig
  readonly trustedAwsServices: string[]
  readonly organizationAdminRoleName: string | null
  readonly accountAdminRoleName: string | null
  readonly accountBootstrapRoleName: string | null
}
