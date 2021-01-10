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
} from "@takomo/deployment-targets-model"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"

/**
 * @hidden
 */
export interface TargetsExecutionPlan {
  readonly groups: ReadonlyArray<DeploymentGroupConfig>
  readonly hasChanges: boolean
}

export interface DeploymentTargetsOperationInput extends CommandInput {
  readonly groups: ReadonlyArray<DeploymentGroupPath>
  readonly targets: ReadonlyArray<DeploymentTargetName>
  readonly operation: DeploymentOperation
  readonly configSetType: ConfigSetType
}

export interface DeploymentTargetsOperationOutput extends CommandOutput {
  readonly results: ReadonlyArray<DeploymentGroupDeployResult>
}

export interface DeploymentTargetsOperationIO
  extends IO<DeploymentTargetsOperationOutput> {
  readonly createStackDeployIO: (loggerName: string) => DeployStacksIO
  readonly createStackUndeployIO: (loggerName: string) => UndeployStacksIO
  readonly confirmOperation: (plan: TargetsExecutionPlan) => Promise<boolean>
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
}
