import {
  ConfigSetExecutionPlan,
  ConfigSetName,
  ConfigSetType,
  CreateTargetListenerProps,
  PlanExecutionResult,
  TargetListener,
} from "@takomo/config-sets"
import { CommandInput, IO, OutputFormat } from "@takomo/core"
import { DeploymentTargetsContext } from "@takomo/deployment-targets-context"
import {
  DeploymentGroupPath,
  DeploymentTargetNamePattern,
  Label,
} from "@takomo/deployment-targets-model"
import {
  DeployStacksIO,
  StacksOperationOutput,
  UndeployStacksIO,
} from "@takomo/stacks-commands"
import { CommandPath, DeploymentOperation } from "@takomo/stacks-model"
import { Timer, TkmLogger } from "@takomo/util"
import { PlannedDeploymentTarget } from "../common/plan/model"

export type ConfirmOperationAnswer =
  | "CANCEL"
  | "CONTINUE_AND_REVIEW"
  | "CONTINUE_NO_REVIEW"

export type TargetsExecutionPlan =
  ConfigSetExecutionPlan<PlannedDeploymentTarget>

export interface DeploymentTargetsOperationInput extends CommandInput {
  readonly groups: ReadonlyArray<DeploymentGroupPath>
  readonly targets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly excludeTargets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly labels: ReadonlyArray<Label>
  readonly excludeLabels: ReadonlyArray<Label>
  readonly operation: DeploymentOperation
  readonly configSetType: ConfigSetType
  readonly concurrentTargets: number
  readonly configSetName?: ConfigSetName
  readonly expectNoChanges: boolean
  readonly commandPath?: CommandPath
}

export interface DeploymentTargetsOperationOutput
  extends PlanExecutionResult<StacksOperationOutput> {
  readonly outputFormat: OutputFormat
}

export interface DeploymentTargetsListener {
  readonly onTargetBegin: () => Promise<void>
  readonly onTargetComplete: () => Promise<void>
}

export interface DeploymentTargetsOperationIO
  extends IO<DeploymentTargetsOperationOutput> {
  readonly createStackDeployIO: (logger: TkmLogger) => DeployStacksIO
  readonly createStackUndeployIO: (logger: TkmLogger) => UndeployStacksIO
  readonly confirmOperation: (
    plan: TargetsExecutionPlan,
  ) => Promise<ConfirmOperationAnswer>
  readonly createTargetListener: (
    props: CreateTargetListenerProps,
  ) => TargetListener
}

export interface InitialHolder {
  readonly timer: Timer
  readonly ctx: DeploymentTargetsContext
  readonly io: DeploymentTargetsOperationIO
  readonly input: DeploymentTargetsOperationInput
}

export interface PlanHolder extends InitialHolder {
  readonly plan: TargetsExecutionPlan
}
