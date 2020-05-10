import { DetailedOrganizationalUnit } from "@takomo/aws-clients"
import { ConfigSet, ConfigSetName, ConfigSetType } from "@takomo/config-sets"
import { AccountId, CommandOutputBase } from "@takomo/core"
import { StopWatch } from "@takomo/util"
import {
  Account,
  Organization,
  OrganizationalUnitId,
  OrganizationalUnitName,
  Policy,
  PolicyContent,
  PolicyDescription,
  PolicyId,
  PolicyName,
  PolicyType,
} from "aws-sdk/clients/organizations"
import { DeployOrganizationInput, DeployOrganizationIO } from "./command/deploy"
import { OrganizationContext } from "./context"

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

export interface OrganizationAccount {
  readonly id: AccountId
  readonly description: string | null
  readonly name: string | null
  readonly email: string | null
  readonly accountAdminRoleName: string | null
  readonly accountBootstrapRoleName: string | null
  readonly vars: any
  readonly status: OrganizationAccountStatus
  readonly configSets: ConfigSetName[]
  readonly bootstrapConfigSets: ConfigSetName[]
  readonly serviceControlPolicies: PolicyName[]
  readonly tagPolicies: PolicyName[]
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

export interface PolicyConfig {
  readonly name: string
  readonly awsManaged: boolean
  readonly description: string
}

export interface OrganizationalUnit {
  readonly serviceControlPolicies: PolicyName[]
  readonly tagPolicies: PolicyName[]
  readonly name: OrganizationalUnitName
  readonly path: OrganizationalUnitPath
  readonly priority: number
  readonly accountAdminRoleName: string | null
  readonly accountBootstrapRoleName: string | null
  readonly description: string | null
  readonly vars: any
  readonly status: OrganizationalUnitStatus
  readonly configSets: ConfigSetName[]
  readonly bootstrapConfigSets: ConfigSetName[]
  readonly accounts: OrganizationAccount[]
  readonly children: OrganizationalUnit[]
}

export interface OrganizationalUnitsConfig {
  readonly Root: OrganizationalUnit
}

export interface PoliciesConfig {
  readonly enabled: boolean
  readonly policyType: PolicyType
  readonly policies: PolicyConfig[]
}

export interface OrganizationConfigFile {
  readonly masterAccountId: AccountId
  readonly accountCreation: AccountCreationConfig
  readonly configSets: ConfigSet[]
  readonly vars: any
  readonly serviceControlPolicies: PoliciesConfig
  readonly tagPolicies: PoliciesConfig
  readonly organizationalUnits: OrganizationalUnitsConfig
  readonly trustedAwsServices: string[]
  readonly organizationAdminRoleName: string | null
  readonly accountAdminRoleName: string | null
  readonly accountBootstrapRoleName: string | null
}

export interface PlannedPolicies {
  readonly retain: PolicyName[]
  readonly add: PolicyName[]
  readonly remove: PolicyName[]
}

export interface PlannedAccount {
  readonly id: AccountId
  readonly operation: string
  readonly serviceControlPolicies: PlannedPolicies
  readonly tagPolicies: PlannedPolicies
}

export interface PlannedAccounts {
  readonly retain: PlannedAccount[]
  readonly add: PlannedAccount[]
  readonly remove: PlannedAccount[]
}

export interface PlannedOrganizationalUnit {
  readonly path: OrganizationalUnitPath
  readonly priority: number
  readonly currentName: OrganizationalUnitName | null
  readonly newName: OrganizationalUnitName | null
  readonly id: OrganizationalUnitId | null
  readonly parentId: OrganizationalUnitId | null
  readonly operation: string
  readonly children: PlannedOrganizationalUnit[]
  readonly serviceControlPolicies: PlannedPolicies
  readonly tagPolicies: PlannedPolicies
  readonly accounts: PlannedAccounts
}

export interface PlannedPolicy {
  readonly name: PolicyName
  readonly type: PolicyType
  readonly operation: string
  readonly id: PolicyId | null
  readonly awsManaged: boolean
  readonly currentDescription: PolicyDescription | null
  readonly newDescription: PolicyDescription | null
  readonly newContent: PolicyContent | null
  readonly currentContent: PolicyContent | null
}

export interface PolicyDeploymentPlan {
  readonly skip: boolean
  readonly hasChanges: boolean
  readonly serviceControlPolicies: PlannedPolicy[]
  readonly tagPolicies: PlannedPolicy[]
}

export interface OrganizationalUnitsDeploymentPlan {
  readonly hasChanges: boolean
  readonly root: PlannedOrganizationalUnit
}

export interface PlannedLaunchableAccount {
  readonly account: Account
  readonly config: OrganizationAccount
}

export interface PlannedAccountDeploymentOrganizationalUnit {
  readonly path: string
  readonly accountAdminRoleName: string | null
  readonly accountBootstrapRoleName: string | null
  readonly accounts: PlannedLaunchableAccount[]
  readonly vars: any
  readonly configSets: string[]
}

export interface AccountsLaunchPlan {
  readonly hasChanges: boolean
  readonly organizationalUnits: PlannedAccountDeploymentOrganizationalUnit[]
  readonly configSetType: ConfigSetType
}

export interface OrganizationTrustedServicesPlan {
  readonly add: string[]
  readonly retain: string[]
  readonly remove: string[]
}

export interface EnabledPoliciesPlan {
  readonly add: string[]
  readonly retain: string[]
  readonly remove: string[]
}

export interface OrganizationBasicConfigDeploymentPlan {
  readonly skip: boolean
  readonly hasChanges: boolean
  readonly trustedServices: OrganizationTrustedServicesPlan
  readonly enabledPolicies: EnabledPoliciesPlan
}

export interface PolicyDeploymentResult extends CommandOutputBase {
  readonly id: string
  readonly type: string
  readonly name: string
  readonly awsManaged: boolean
  readonly policy: Policy | null
}

export interface PoliciesDeploymentResult extends CommandOutputBase {
  readonly results: PolicyDeploymentResult[]
}

export interface OrganizationalUnitDeploymentResult extends CommandOutputBase {
  readonly id: string | null
  readonly name: string
}

export interface OrganizationalUnitsDeploymentResult extends CommandOutputBase {
  readonly results: OrganizationalUnitDeploymentResult[]
}

export type OrganizationBasicConfigDeploymentResult = CommandOutputBase

export interface InitialOrganizationDeployContext {
  readonly watch: StopWatch
  readonly ctx: OrganizationContext
  readonly io: DeployOrganizationIO
  readonly input: DeployOrganizationInput
  readonly result: CommandOutputBase | null
}

export interface OrganizationDataHolder
  extends InitialOrganizationDeployContext {
  organizationData: OrganizationData
}

export interface OrganizationData {
  readonly currentTagPolicies: Policy[]
  readonly currentServiceControlPolicies: Policy[]
  readonly currentServiceControlPoliciesByTarget: Map<string, PolicyName[]>
  readonly currentTagPoliciesByTarget: Map<string, PolicyName[]>
  readonly currentRootOrganizationalUnit: DetailedOrganizationalUnit
  readonly currentAccounts: Account[]
  readonly currentTrustedAwsServices: string[]
  readonly currentEnabledPolicies: PolicyType[]
  readonly currentOrganization: Organization
  readonly currentOrganizationHasAllFeaturesEnabled: boolean
}

export interface DeploymentPlanHolder extends OrganizationDataHolder {
  readonly plan: OrganizationLaunchPlan
}

export interface OrganizationLaunchPlan {
  readonly policiesPlan: PolicyDeploymentPlan
  readonly organizationalUnitsPlan: OrganizationalUnitsDeploymentPlan
  readonly organizationBasicConfigPlan: OrganizationBasicConfigDeploymentPlan
  readonly hasChanges: boolean
}

export interface OrganizationBasicConfigDeploymentResultHolder
  extends DeploymentPlanHolder {
  readonly organizationBasicConfigDeploymentResult: OrganizationBasicConfigDeploymentResult
}

export interface PoliciesDeploymentResultHolder
  extends OrganizationBasicConfigDeploymentResultHolder {
  readonly policiesDeploymentResult: PoliciesDeploymentResult
}

export interface OrganizationalUnitsDeploymentResultHolder
  extends PoliciesDeploymentResultHolder {
  readonly organizationalUnitsDeploymentResult: OrganizationalUnitsDeploymentResult
}

export interface OrganizationalUnitsCleanResultHolder
  extends OrganizationalUnitsDeploymentResultHolder {
  readonly organizationalUnitsCleanResult: OrganizationalUnitsDeploymentResult
}

export interface PoliciesCleanResultHolder
  extends OrganizationalUnitsCleanResultHolder {
  readonly policiesCleanResult: PoliciesDeploymentResult
}

export interface OrganizationBasicConfigCleanResultHolder
  extends PoliciesCleanResultHolder {
  readonly organizationBasicConfigCleanResult: OrganizationBasicConfigDeploymentResult
}
