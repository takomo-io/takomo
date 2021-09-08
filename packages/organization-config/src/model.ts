import {
  AccountEmail,
  AccountId,
  AccountName,
  IamRoleName,
  OrganizationalUnitName,
  OrganizationPolicyName,
  OrganizationPolicyType,
} from "@takomo/aws-model"
import { ConfigSet, ConfigSetInstruction, StageName } from "@takomo/config-sets"
import {
  OrganizationAccountStatus,
  OrganizationalUnitPath,
  OrganizationalUnitStatus,
} from "@takomo/organization-model"

export interface NewAccountDefaults {
  readonly iamUserAccessToBilling: boolean
  readonly roleName: string
}

export interface NewAccountConstraints {
  readonly emailPattern?: RegExp
  readonly namePattern?: RegExp
}

export interface AccountCreationConfig {
  readonly defaults: NewAccountDefaults
  readonly constraints: NewAccountConstraints
}

export interface OrganizationPolicyConfig {
  readonly name: string
  readonly awsManaged: boolean
  readonly description: string
  readonly dynamic: boolean
}

export interface OrganizationPoliciesConfig {
  readonly enabled: boolean
  readonly policyType: OrganizationPolicyType
  readonly policies: ReadonlyArray<OrganizationPolicyConfig>
}

export interface OrgEntityPolicies {
  readonly attached: ReadonlyArray<OrganizationPolicyName>
  readonly inherited: ReadonlyArray<OrganizationPolicyName>
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
  readonly configSets: ReadonlyArray<ConfigSetInstruction>
  readonly bootstrapConfigSets: ReadonlyArray<ConfigSetInstruction>
  readonly accountAdminRoleName: IamRoleName
  readonly accountBootstrapRoleName: IamRoleName
  readonly description?: string
}

export interface OrganizationAccountConfig extends OrgEntity {
  readonly id: AccountId
  readonly name?: AccountName
  readonly email?: AccountEmail
  readonly status: OrganizationAccountStatus
}

export interface OrganizationalUnitConfig extends OrgEntity {
  readonly name: OrganizationalUnitName
  readonly path: OrganizationalUnitPath
  readonly priority: number
  readonly status: OrganizationalUnitStatus
  readonly accounts: ReadonlyArray<OrganizationAccountConfig>
  readonly children: ReadonlyArray<OrganizationalUnitConfig>
}

export interface OrganizationalUnitsConfig {
  readonly Root: OrganizationalUnitConfig
}

export interface OrganizationConfig {
  readonly masterAccountId: AccountId
  readonly accountCreation: AccountCreationConfig
  readonly configSets: ReadonlyArray<ConfigSet>
  readonly stages: ReadonlyArray<StageName>
  readonly vars: any
  readonly serviceControlPolicies: OrganizationPoliciesConfig
  readonly tagPolicies: OrganizationPoliciesConfig
  readonly aiServicesOptOutPolicies: OrganizationPoliciesConfig
  readonly backupPolicies: OrganizationPoliciesConfig
  readonly organizationalUnits: OrganizationalUnitsConfig
  readonly organizationAdminRoleName?: IamRoleName
  readonly accountAdminRoleName: IamRoleName
  readonly accountBootstrapRoleName: IamRoleName
}
