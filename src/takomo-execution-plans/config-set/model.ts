import { InternalCredentialManager } from "../../aws/common/credentials.js"
import { CommandPath } from "../../command/command-model.js"
import {
  ConfigSet,
  ConfigSetName,
  StageName,
} from "../../config-sets/config-set-model.js"
import {
  CommandOutput,
  CommandOutputBase,
  OperationState,
} from "../../takomo-core/command.js"
import { TkmLogger } from "../../utils/logging.js"
import { Timer } from "../../utils/timer.js"
import { ExecutionGroupId, ExecutionTargetId } from "../model.js"

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
  readonly defaultCredentialManager: InternalCredentialManager
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
  readonly vars: Record<string, unknown>
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
}

export interface CreateConfigSetTargetListenerProps {
  readonly stageName: StageName
  readonly currentStageNumber: number
  readonly stageCount: number
  readonly targetCount: number
}

export interface ConfigSetTargetListener {
  readonly onTargetBegin: () => Promise<void>
  readonly onGroupBegin: (
    group: ConfigSetExecutionGroup<unknown>,
  ) => Promise<void>
  readonly onTargetComplete: () => Promise<void>
  readonly onGroupComplete: (
    group: ConfigSetExecutionGroup<unknown>,
  ) => Promise<void>
}

export type ConfigSetTargetListenerProvider = (
  props: CreateConfigSetTargetListenerProps,
) => ConfigSetTargetListener
