import { IamRoleName } from "@takomo/aws-model"
import {
  CommandInput,
  CommandOutput,
  CommandOutputBase,
  IO,
  OutputFormat,
} from "@takomo/core"
import { DeploymentGroupConfig } from "@takomo/deployment-targets-config"
import {
  DeploymentGroupPath,
  DeploymentTargetName,
  DeploymentTargetNamePattern,
  Label,
} from "@takomo/deployment-targets-model"
import { Timer } from "@takomo/util"
import { DeploymentTargetsListener } from "../operation/model"

export interface DeploymentTargetsRunInput extends CommandInput {
  readonly groups: ReadonlyArray<DeploymentGroupPath>
  readonly targets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly excludeTargets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly labels: ReadonlyArray<Label>
  readonly excludeLabels: ReadonlyArray<Label>
  readonly concurrentTargets: number
  readonly mapCommand: string
  readonly reduceCommand?: string
  readonly roleName?: IamRoleName
  readonly captureAfterLine?: string
  readonly captureBeforeLine?: string
  readonly captureLastLine: boolean
  readonly outputFormat: OutputFormat
}

export interface DeploymentTargetsRunOutput extends CommandOutput {
  readonly result: unknown
  readonly outputFormat: OutputFormat
}

export interface DeploymentTargetsRunIO extends IO<DeploymentTargetsRunOutput> {
  readonly confirmRun: (plan: TargetsRunPlan) => Promise<boolean>
  readonly createDeploymentTargetsListener: (
    targetCount: number,
  ) => DeploymentTargetsListener
}

export interface TargetsRunPlan {
  readonly groups: ReadonlyArray<DeploymentGroupConfig>
}

export interface DeploymentTargetRunResult extends CommandOutputBase {
  readonly name: DeploymentTargetName
  readonly timer: Timer
  readonly value?: unknown
}

export interface DeploymentGroupRunResult extends CommandOutputBase {
  readonly path: DeploymentGroupPath
  readonly timer: Timer
  readonly results: ReadonlyArray<DeploymentTargetRunResult>
}
