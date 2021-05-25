import { IamRoleName } from "@takomo/aws-model"
import { ConfigSetType } from "@takomo/config-sets"
import {
  CommandInput,
  CommandOutput,
  CommandOutputBase,
  IO,
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
  readonly configSetType: ConfigSetType
  readonly concurrentTargets: number
  readonly command: string
  readonly roleName?: IamRoleName
}

export interface DeploymentTargetsRunOutput extends CommandOutput {
  readonly results: ReadonlyArray<DeploymentGroupRunResult>
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
}

export interface DeploymentGroupRunResult extends CommandOutputBase {
  readonly path: DeploymentGroupPath
  readonly timer: Timer
  readonly results: ReadonlyArray<DeploymentTargetRunResult>
}
