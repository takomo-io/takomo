import {
  ConfigSetName,
  ConfigSetType,
} from "../../../config-sets/config-set-model"
import { DeploymentTargetsContext } from "../../../context/targets-context"
import { CommandInput, IO, OutputFormat } from "../../../takomo-core/command"
import {
  ConfigSetExecutionPlan,
  ConfigSetPlanExecutionResult,
  ConfigSetTargetListener,
  CreateConfigSetTargetListenerProps,
} from "../../../takomo-execution-plans"
import {
  DeploymentGroupPath,
  DeploymentTargetNamePattern,
  Label,
} from "../../../targets/targets-model"
import { TkmLogger } from "../../../utils/logging"
import { Timer } from "../../../utils/timer"
import { CommandPath, DeploymentOperation } from "../../command-model"
import { DeployStacksIO } from "../../stacks/deploy/model"
import { StacksOperationOutput } from "../../stacks/model"
import { UndeployStacksIO } from "../../stacks/undeploy/model"
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
