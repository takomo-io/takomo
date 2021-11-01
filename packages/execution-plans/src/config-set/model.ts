import { CredentialManager } from "@takomo/aws-clients"
import {
  ConfigSet,
  ConfigSetName,
  ConfigSetType,
  StageName,
} from "@takomo/config-sets"
import { CommandOutput, CommandOutputBase, OperationState } from "@takomo/core"
import { CommandPath } from "@takomo/stacks-model"
import { Timer, TkmLogger } from "@takomo/util"
import { ExecutionGroupId, ExecutionTargetId } from "../model"

export interface CommandPathExecutionResult<R extends CommandOutput>
  extends CommandOutputBase {
  readonly commandPath: CommandPath
  readonly result: R
  readonly timer: Timer
}

export interface ConfigSetExecutionResult<R extends CommandOutput>
  extends CommandOutputBase {
  readonly configSetName: ConfigSetName
  readonly results: ReadonlyArray<CommandPathExecutionResult<R>>
  readonly timer: Timer
}

export interface ConfigSetTargetExecutionResult<R extends CommandOutput>
  extends CommandOutputBase {
  readonly targetId: ExecutionTargetId
  readonly results: ReadonlyArray<ConfigSetExecutionResult<R>>
  readonly timer: Timer
}

export interface ConfigSetGroupExecutionResult<R extends CommandOutput>
  extends CommandOutputBase {
  readonly groupId: ExecutionGroupId
  readonly results: ReadonlyArray<ConfigSetTargetExecutionResult<R>>
  readonly timer: Timer
}

export interface ConfigSetStageExecutionResult<R extends CommandOutput>
  extends CommandOutputBase {
  readonly stageName: StageName
  readonly results: ReadonlyArray<ConfigSetGroupExecutionResult<R>>
  readonly timer: Timer
}

export interface ConfigSetPlanExecutionResult<R extends CommandOutput>
  extends CommandOutput {
  readonly results: ReadonlyArray<ConfigSetStageExecutionResult<R>>
}

export interface ConfigSetTargetExecutorProps<C> {
  readonly state: OperationState
  readonly target: ConfigSetExecutionTarget<C>
  readonly defaultCredentialManager: CredentialManager
  readonly commandPath: CommandPath
  readonly timer: Timer
  readonly configSet: ConfigSet
  readonly logger: TkmLogger
}

export type ConfigSetTargetExecutor<R extends CommandOutput, C> = (
  props: ConfigSetTargetExecutorProps<C>,
) => Promise<R>

export interface ConfigSetExecution {
  readonly name: ConfigSetName
  readonly commandPaths: ReadonlyArray<CommandPath>
}

export interface ConfigSetExecutionTarget<C> {
  readonly vars: any
  readonly configSets: ReadonlyArray<ConfigSetExecution>
  readonly id: ExecutionTargetId
  readonly data: C
}

export interface ConfigSetExecutionGroup<C> {
  readonly id: ExecutionGroupId
  readonly targets: ReadonlyArray<ConfigSetExecutionTarget<C>>
}

export interface ConfigSetExecutionStage<C> {
  readonly stageName: StageName
  readonly groups: ReadonlyArray<ConfigSetExecutionGroup<C>>
}

export interface ConfigSetExecutionPlan<C> {
  readonly stages: ReadonlyArray<ConfigSetExecutionStage<C>>
  readonly configSetType: ConfigSetType
}

export interface CreateConfigSetTargetListenerProps {
  readonly stageName: StageName
  readonly currentStageNumber: number
  readonly stageCount: number
  readonly targetCount: number
}

export interface ConfigSetTargetListener {
  readonly onTargetBegin: () => Promise<void>
  readonly onGroupBegin: (group: ConfigSetExecutionGroup<any>) => Promise<void>
  readonly onTargetComplete: () => Promise<void>
  readonly onGroupComplete: (
    group: ConfigSetExecutionGroup<any>,
  ) => Promise<void>
}

export type ConfigSetTargetListenerProvider = (
  props: CreateConfigSetTargetListenerProps,
) => ConfigSetTargetListener
