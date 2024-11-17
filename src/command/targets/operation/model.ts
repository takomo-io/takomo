import { ConfigSetName } from "../../../config-sets/config-set-model.js"
import { DeploymentTargetsContext } from "../../../context/targets-context.js"
import { CommandInput, IO, OutputFormat } from "../../../takomo-core/command.js"
import {
  DeploymentGroupPath,
  DeploymentTargetNamePattern,
  Label,
} from "../../../targets/targets-model.js"
import { TkmLogger } from "../../../utils/logging.js"
import { Timer } from "../../../utils/timer.js"
import { CommandPath, DeploymentOperation } from "../../command-model.js"
import { DeployStacksIO } from "../../stacks/deploy/model.js"
import { StacksOperationOutput } from "../../stacks/model.js"
import { UndeployStacksIO } from "../../stacks/undeploy/model.js"
import { PlannedDeploymentTarget } from "../common/plan/model.js"
import {
  ConfigSetExecutionPlan,
  ConfigSetPlanExecutionResult,
  ConfigSetTargetListener,
  CreateConfigSetTargetListenerProps,
} from "../../../takomo-execution-plans/config-set/model.js"

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
  readonly concurrentTargets: number
  readonly configSetName?: ConfigSetName
  readonly expectNoChanges: boolean
  readonly prune: boolean
  readonly commandPath?: CommandPath
}

export interface DeploymentTargetsOperationOutput
  extends ConfigSetPlanExecutionResult<StacksOperationOutput> {
  readonly outputFormat: OutputFormat
}

export interface DeploymentTargetsListener {
  readonly onTargetBegin: () => Promise<void>
  readonly onTargetComplete: () => Promise<void>
}

export interface DeploymentTargetsOperationIO
  extends IO<DeploymentTargetsOperationOutput> {
  readonly createStackDeployIO: (
    logger: TkmLogger,
    target: PlannedDeploymentTarget,
  ) => DeployStacksIO
  readonly createStackUndeployIO: (
    logger: TkmLogger,
    target: PlannedDeploymentTarget,
  ) => UndeployStacksIO
  readonly confirmOperation: (
    plan: TargetsExecutionPlan,
  ) => Promise<ConfirmOperationAnswer>
  readonly createTargetListener: (
    props: CreateConfigSetTargetListenerProps,
  ) => ConfigSetTargetListener
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
