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

export interface TargetExecutionResult<R extends CommandOutput>
  extends CommandOutputBase {
  readonly targetId: ExecutionTargetId
  readonly results: ReadonlyArray<ConfigSetExecutionResult<R>>
  readonly timer: Timer
}

export interface GroupExecutionResult<R extends CommandOutput>
  extends CommandOutputBase {
  readonly groupId: ExecutionGroupPath
  readonly results: ReadonlyArray<TargetExecutionResult<R>>
  readonly timer: Timer
}

export interface StageExecutionResult<R extends CommandOutput>
  extends CommandOutputBase {
  readonly stageName: StageName
  readonly results: ReadonlyArray<GroupExecutionResult<R>>
  readonly timer: Timer
}

export interface PlanExecutionResult<R extends CommandOutput>
  extends CommandOutput {
  readonly results: ReadonlyArray<StageExecutionResult<R>>
}

export interface TargetExecutorProps<C> {
  readonly state: OperationState
  readonly target: ExecutionTarget<C>
  readonly defaultCredentialManager: CredentialManager
  readonly commandPath: CommandPath
  readonly timer: Timer
  readonly configSet: ConfigSet
  readonly logger: TkmLogger
}

export type TargetExecutor<R extends CommandOutput, C> = (
  props: TargetExecutorProps<C>,
) => Promise<R>

export interface ExecutionConfigSet {
  readonly name: ConfigSetName
  readonly commandPaths: ReadonlyArray<CommandPath>
}

export type ExecutionTargetId = string

export interface ExecutionTarget<C> {
  readonly vars: any
  readonly configSets: ReadonlyArray<ExecutionConfigSet>
  readonly id: ExecutionTargetId
  readonly data: C
}

export type ExecutionGroupPath = string

export interface ExecutionGroup<C> {
  readonly path: ExecutionGroupPath
  readonly targets: ReadonlyArray<ExecutionTarget<C>>
}

export interface ExecutionStage<C> {
  readonly stageName: StageName
  readonly groups: ReadonlyArray<ExecutionGroup<C>>
}

export interface ExecutionPlan<C> {
  readonly stages: ReadonlyArray<ExecutionStage<C>>
}

export interface ConfigSetExecutionPlan<C> extends ExecutionPlan<C> {
  readonly configSetType: ConfigSetType
}

export interface CreateTargetListenerProps {
  readonly stageName: StageName
  readonly currentStageNumber: number
  readonly stageCount: number
  readonly targetCount: number
}

export interface TargetListener {
  readonly onTargetBegin: () => Promise<void>
  readonly onGroupBegin: (group: ExecutionGroup<any>) => Promise<void>
  readonly onTargetComplete: () => Promise<void>
  readonly onGroupComplete: (group: ExecutionGroup<any>) => Promise<void>
}

export type TargetListenerProvider = (
  props: CreateTargetListenerProps,
) => TargetListener
