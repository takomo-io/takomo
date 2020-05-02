import { ConfigSetOperationResult } from "@takomo/config-sets"
import {
  CommandInput,
  CommandOutput,
  CommandOutputBase,
  DeploymentOperation,
  IO,
  Options,
} from "@takomo/core"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks"
import { StopWatch } from "@takomo/util"
import { DeploymentGroupConfig, DeploymentTargetsContext } from "../../model"

export interface TargetsExecutionPlan {
  readonly groups: DeploymentGroupConfig[]
  readonly hasChanges: boolean
}

export interface DeploymentTargetsOperationInput extends CommandInput {
  readonly groups: string[]
  readonly targets: string[]
  readonly configFile: string | null
  readonly operation: DeploymentOperation
}

export interface DeploymentTargetsOperationOutput extends CommandOutput {
  readonly results: DeploymentGroupDeployResult[]
}

export interface DeploymentTargetsOperationIO extends IO {
  createStackDeployIO(options: Options, loggerName: string): DeployStacksIO
  createStackUndeployIO(options: Options, loggerName: string): UndeployStacksIO
  confirmOperation(plan: TargetsExecutionPlan): Promise<boolean>
  printOutput(
    output: DeploymentTargetsOperationOutput,
  ): DeploymentTargetsOperationOutput
}

export interface DeploymentTargetDeployResult extends CommandOutputBase {
  readonly name: string
  readonly results: ConfigSetOperationResult[]
  readonly watch: StopWatch
}

export interface DeploymentGroupDeployResult extends CommandOutputBase {
  readonly path: string
  readonly watch: StopWatch
  readonly results: DeploymentTargetDeployResult[]
}

export interface InitialHolder {
  readonly watch: StopWatch
  readonly ctx: DeploymentTargetsContext
  readonly io: DeploymentTargetsOperationIO
  readonly input: DeploymentTargetsOperationInput
}

export interface PlanHolder extends InitialHolder {
  readonly plan: TargetsExecutionPlan
}
