import { AwsCredentialIdentity } from "@aws-sdk/types"
import { IamRoleArn, IamRoleName } from "../../../aws/common/model.js"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "../../../config/targets-config.js"
import {
  CommandInput,
  CommandOutput,
  CommandOutputBase,
  IO,
} from "../../../takomo-core/command.js"
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

/**
 * Properties used to invoke {MapFunction}.
 */
export interface MapFunctionProps {
  /**
   * AWS credentials for the target
   */
  readonly credentials?: AwsCredentialIdentity

  /**
   * Target configuration
   */
  readonly target: DeploymentTargetConfig

  /**
   * Path of deployment group where the target belongs to
   */
  readonly deploymentGroupPath: DeploymentGroupPath

  /**
   * Map arguments from the command line
   */
  readonly args: unknown
}

/**
 * Map function of run command.
 */
export type MapFunction<T> = (props: MapFunctionProps) => Promise<T>

/**
 * Properties used to invoke {ReduceFunction}.
 */
export interface ReduceFunctionProps<T> {
  /**
   * AWS credentials for the reduce function
   */
  readonly credentials?: AwsCredentialIdentity

  /**
   * Targets returned from map functions
   */
  readonly targets: ReadonlyArray<T>
}

/**
 * Reduce function of run command.
 *
 * @typeParam T - Type of targets
 * @typeParam O - Type of result the reduce function returns
 */
export type ReduceFunction<T, O> = (props: ReduceFunctionProps<T>) => Promise<O>
