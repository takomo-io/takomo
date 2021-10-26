import { CredentialManager } from "@takomo/aws-clients"
import {
  CommandOutput,
  CommandOutputBase,
  OperationState,
  Vars,
} from "@takomo/core"
import { CommandPath } from "@takomo/stacks-model"
import { Timer, TkmLogger } from "@takomo/util"

export type ConfigSetName = string
export type StageName = string

export const DEFAULT_STAGE_NAME = "default"

export interface ConfigSetInstruction {
  readonly name: ConfigSetName
  readonly stage: StageName
}

export interface ConfigSet {
  readonly description: string
  readonly name: ConfigSetName
  readonly vars: Vars
  readonly commandPaths: ReadonlyArray<CommandPath>
  readonly legacy: boolean
}

export type ConfigSetType = "standard" | "bootstrap"

// export interface ConfigSetCommandPathOperationResult extends CommandOutputBase {
//   readonly commandPath: CommandPath
//   readonly stage?: StageName
//   readonly result: StacksOperationOutput
// }

// export interface ConfigSetOperationResult extends CommandOutput {
//   readonly configSetName: ConfigSetName
//   readonly results: ReadonlyArray<ConfigSetCommandPathOperationResult>
// }

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
  readonly targetId: string
  readonly results: ReadonlyArray<ConfigSetExecutionResult<R>>
  readonly timer: Timer
}

export interface GroupExecutionResult<R extends CommandOutput>
  extends CommandOutputBase {
  readonly groupId: string
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

export type ExecutionTargetId = string

export interface ExecutionConfigSet {
  readonly name: ConfigSetName
  readonly commandPaths: ReadonlyArray<CommandPath>
}

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
  readonly stageName: string
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

export type TargetListenerProvider = ({
  stageName,
  currentStageNumber,
  stageCount,
  targetCount,
}: CreateTargetListenerProps) => TargetListener

export interface ConfigSetContext {
  readonly getConfigSet: (name: ConfigSetName) => ConfigSet
  readonly hasConfigSet: (name: ConfigSetName) => boolean
  readonly getStages: () => ReadonlyArray<StageName>
}

export interface ConfigSetInstructionsHolder {
  readonly configSets: ReadonlyArray<ConfigSetInstruction>
  readonly bootstrapConfigSets: ReadonlyArray<ConfigSetInstruction>
}
