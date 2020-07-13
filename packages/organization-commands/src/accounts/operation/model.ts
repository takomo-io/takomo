import { ConfigSetOperationResult, ConfigSetType } from "@takomo/config-sets"
import {
  AccountId,
  CommandInput,
  CommandOutput,
  CommandOutputBase,
  ConfirmResult,
  DeploymentOperation,
  IO,
  Options,
} from "@takomo/core"
import { OrganizationAccount } from "@takomo/organization-config"
import {
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { StopWatch } from "@takomo/util"
import { Account } from "aws-sdk/clients/organizations"

export interface InitialLaunchAccountsContext {
  readonly watch: StopWatch
  readonly ctx: OrganizationContext
  readonly io: AccountsOperationIO
  readonly input: AccountsOperationInput
}

export interface LaunchAccountsDataHolder extends InitialLaunchAccountsContext {
  readonly organizationState: OrganizationState
}

export interface LaunchAccountsPlanHolder extends InitialLaunchAccountsContext {
  readonly plan: AccountsLaunchPlan
}

export interface AccountsOperationInput extends CommandInput {
  readonly organizationalUnits: string[]
  readonly accountIds: AccountId[]
  readonly operation: DeploymentOperation
  readonly configSetType: ConfigSetType
}

export interface AccountOperationResult extends CommandOutputBase {
  readonly accountId: AccountId
  readonly results: ConfigSetOperationResult[]
  readonly watch: StopWatch
}

export interface OrganizationalUnitAccountsOperationResult
  extends CommandOutputBase {
  readonly path: string
  readonly results: AccountOperationResult[]
  readonly watch: StopWatch
}

export interface AccountsOperationOutput extends CommandOutput {
  readonly results: OrganizationalUnitAccountsOperationResult[]
}

export interface AccountsOperationIO extends IO {
  createStackDeployIO(options: Options, accountId: string): DeployStacksIO
  createStackUndeployIO(options: Options, accountId: string): UndeployStacksIO
  printOutput(output: AccountsOperationOutput): AccountsOperationOutput
  confirmLaunch(plan: AccountsLaunchPlan): Promise<ConfirmResult>
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
