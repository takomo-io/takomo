import { AccountId } from "@takomo/aws-model"
import {
  ConfigSetName,
  ConfigSetOperationResult,
  ConfigSetType,
  CreateTargetListenerProps,
  ExecutionPlan,
  PlanExecutionResult,
  StageName,
  TargetListener,
} from "@takomo/config-sets"
import {
  CommandInput,
  CommandOutputBase,
  ConfirmResult,
  IO,
  OutputFormat,
} from "@takomo/core"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import {
  DeployStacksIO,
  StacksOperationOutput,
  UndeployStacksIO,
} from "@takomo/stacks-commands"
import { CommandPath, DeploymentOperation } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import { PlannedOrganizationAccount } from "../common/plan"

export interface AccountsOperationInput extends CommandInput {
  readonly organizationalUnits: ReadonlyArray<string>
  readonly accountIds: ReadonlyArray<AccountId>
  readonly operation: DeploymentOperation
  readonly configSetType: ConfigSetType
  readonly concurrentAccounts: number
  readonly configSetName?: ConfigSetName
  readonly commandPath?: CommandPath
}

export interface AccountOperationResult extends CommandOutputBase {
  readonly accountId: AccountId
  readonly results: ReadonlyArray<ConfigSetOperationResult>
  readonly timer: Timer
}

export interface OrganizationalUnitAccountsOperationResult
  extends CommandOutputBase {
  readonly path: OrganizationalUnitPath
  readonly results: ReadonlyArray<AccountOperationResult>
  readonly stage?: StageName
  readonly timer: Timer
}

export interface AccountsOperationOutput
  extends PlanExecutionResult<StacksOperationOutput> {
  readonly outputFormat: OutputFormat
}

export interface AccountsOperationIO extends IO<AccountsOperationOutput> {
  readonly createStackDeployIO: (accountId: AccountId) => DeployStacksIO
  readonly createStackUndeployIO: (accountId: AccountId) => UndeployStacksIO
  readonly confirmLaunch: (
    plan: AccountsOperationPlan,
  ) => Promise<ConfirmResult>
  readonly createTargetListener: (
    props: CreateTargetListenerProps,
  ) => TargetListener
}

export type AccountsOperationPlan = ExecutionPlan<PlannedOrganizationAccount>
