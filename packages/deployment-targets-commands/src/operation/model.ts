import { ConfigSetOperationResult, ConfigSetType } from "@takomo/config-sets"
import {
  CommandInput,
  CommandOutput,
  CommandOutputBase,
  IO,
} from "@takomo/core"
import { DeploymentGroupConfig } from "@takomo/deployment-targets-config"
import { DeploymentTargetsContext } from "@takomo/deployment-targets-context"
import {
  DeploymentGroupPath,
  DeploymentTargetName,
  DeploymentTargetNamePattern,
  Label,
} from "@takomo/deployment-targets-model"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"

export type ConfirmOperationAnswer =
  | "CANCEL"
  | "CONTINUE_AND_REVIEW"
  | "CONTINUE_NO_REVIEW"

export interface TargetsExecutionPlan {
  readonly groups: ReadonlyArray<DeploymentGroupConfig>
  readonly hasChanges: boolean
  readonly configSetType: ConfigSetType
}

export interface DeploymentTargetsOperationInput extends CommandInput {
  readonly groups: ReadonlyArray<DeploymentGroupPath>
  readonly targets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly excludeTargets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly labels: ReadonlyArray<Label>
  readonly operation: DeploymentOperation
  readonly configSetType: ConfigSetType
  readonly concurrentTargets: number
}

export interface DeploymentTargetsOperationOutput extends CommandOutput {
  readonly results: ReadonlyArray<DeploymentGroupDeployResult>
}

export interface DeploymentTargetsListener {
  readonly onTargetBegin: () => Promise<void>
  readonly onTargetComplete: () => Promise<void>
}

export interface DeploymentTargetsOperationIO
  extends IO<DeploymentTargetsOperationOutput> {
  readonly createStackDeployIO: (loggerName: string) => DeployStacksIO
  readonly createStackUndeployIO: (loggerName: string) => UndeployStacksIO
  readonly confirmOperation: (
    plan: TargetsExecutionPlan,
  ) => Promise<ConfirmOperationAnswer>
  readonly createDeploymentTargetsListener: (
    targetCount: number,
  ) => DeploymentTargetsListener
}

export interface DeploymentTargetDeployResult extends CommandOutputBase {
  readonly name: DeploymentTargetName
  readonly results: ReadonlyArray<ConfigSetOperationResult>
  readonly timer: Timer
}

export interface DeploymentGroupDeployResult extends CommandOutputBase {
  readonly path: DeploymentGroupPath
  readonly timer: Timer
  readonly results: ReadonlyArray<DeploymentTargetDeployResult>
}

/**
 * @hidden
 */
export interface InitialHolder {
  readonly timer: Timer
  readonly ctx: DeploymentTargetsContext
  readonly io: DeploymentTargetsOperationIO
  readonly input: DeploymentTargetsOperationInput
}

/**
 * @hidden
 */
export interface PlanHolder extends InitialHolder {
  readonly plan: TargetsExecutionPlan
  readonly listener: DeploymentTargetsListener
}
