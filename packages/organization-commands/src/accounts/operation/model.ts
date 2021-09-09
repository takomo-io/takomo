import { AccountId } from "@takomo/aws-model"
import {
  ConfigSetName,
  ConfigSetType,
  CreateTargetListenerProps,
  ExecutionPlan,
  PlanExecutionResult,
  TargetListener,
} from "@takomo/config-sets"
import { CommandInput, ConfirmResult, IO, OutputFormat } from "@takomo/core"
import {
  DeployStacksIO,
  StacksOperationOutput,
  UndeployStacksIO,
} from "@takomo/stacks-commands"
import { CommandPath, DeploymentOperation } from "@takomo/stacks-model"
import { TkmLogger } from "@takomo/util"
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

export interface AccountsOperationOutput
  extends PlanExecutionResult<StacksOperationOutput> {
  readonly outputFormat: OutputFormat
}

export interface AccountsOperationIO extends IO<AccountsOperationOutput> {
  readonly createStackDeployIO: (logger: TkmLogger) => DeployStacksIO
  readonly createStackUndeployIO: (logger: TkmLogger) => UndeployStacksIO
  readonly confirmLaunch: (
    plan: AccountsOperationPlan,
  ) => Promise<ConfirmResult>
  readonly createTargetListener: (
    props: CreateTargetListenerProps,
  ) => TargetListener
}

export type AccountsOperationPlan = ExecutionPlan<PlannedOrganizationAccount>
