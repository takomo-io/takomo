import { Credentials } from "@aws-sdk/types"

import { IamRoleArn, IamRoleName } from "../../../aws/common/model.js"
import {
  CommandInput,
  CommandOutput,
  CommandOutputBase,
  IO,
} from "../../../takomo-core/command.js"

import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "../../../config/targets-config.js"
import {
  DeploymentGroupPath,
  DeploymentTargetName,
  DeploymentTargetNamePattern,
  Label,
} from "../../../targets/targets-model.js"
import { Timer } from "../../../utils/timer.js"
import { DeploymentTargetsListener } from "../operation/model.js"

export interface DeploymentTargetsRunInput extends CommandInput {
  readonly groups: ReadonlyArray<DeploymentGroupPath>
  readonly targets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly excludeTargets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly labels: ReadonlyArray<Label>
  readonly excludeLabels: ReadonlyArray<Label>
  readonly concurrentTargets: number
  readonly mapCommand: string
  readonly mapArgs?: string
  readonly reduceCommand?: string
  readonly mapRoleName?: IamRoleName
  readonly disableMapRole: boolean
  readonly reduceRoleArn?: IamRoleArn
  readonly captureAfterLine?: string
  readonly captureBeforeLine?: string
  readonly captureLastLine: boolean
}

export interface DeploymentTargetsRunOutput extends CommandOutput {
  readonly result: unknown
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

export interface MapFunctionProps {
  readonly credentials?: Credentials
  readonly target: DeploymentTargetConfig
  readonly deploymentGroupPath: DeploymentGroupPath
  readonly args: unknown
}

export type MapFunction<T> = (props: MapFunctionProps) => Promise<T>

export interface ReduceFunctionProps<T> {
  readonly credentials?: Credentials
  readonly targets: ReadonlyArray<T>
}

export type ReduceFunction<T> = (props: ReduceFunctionProps<T>) => Promise<T>
