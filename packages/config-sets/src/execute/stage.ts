import { CredentialManager } from "@takomo/aws-clients"
import {
  CommandOutput,
  OperationState,
  resolveCommandOutputBase,
} from "@takomo/core"
import { Timer, TkmLogger } from "@takomo/util"
import {
  ConfigSetContext,
  ExecutionStage,
  GroupExecutionResult,
  StageExecutionResult,
  TargetExecutor,
  TargetListenerProvider,
} from "../model"
import { executeGroup } from "./group"

interface ExecuteStageProps<R extends CommandOutput, C> {
  readonly stage: ExecutionStage<C>
  readonly logger: TkmLogger
  readonly state: OperationState
  readonly ctx: ConfigSetContext
  readonly executor: TargetExecutor<R, C>
  readonly concurrentAccounts: number
  readonly currentStageNumber: number
  readonly stageCount: number
  readonly targetListenerProvider: TargetListenerProvider
  readonly defaultCredentialManager: CredentialManager
  readonly timer: Timer
}

export const executeStage = async <R extends CommandOutput, C>({
  stage,
  logger,
  executor,
  state,
  concurrentAccounts,
  targetListenerProvider,
  ctx,
  currentStageNumber,
  stageCount,
  defaultCredentialManager,
  timer,
}: ExecuteStageProps<R, C>): Promise<StageExecutionResult<R>> => {
  const stageName = stage.stageName
  logger.info(`Begin stage '${stageName}'`)

  const targetCount = stage.groups.map((g) => g.targets).flat().length

  const targetListener = targetListenerProvider({
    stageName,
    currentStageNumber,
    stageCount,
    targetCount,
  })

  const results = new Array<GroupExecutionResult<R>>()
  for (const group of stage.groups) {
    const result = await executeGroup<R, C>({
      group,
      ctx,
      executor,
      targetListener,
      state,
      concurrentAccounts,
      defaultCredentialManager,
      timer: timer.startChild(group.path),
      logger: logger.childLogger(group.path),
    })
    results.push(result)
  }

  timer.stop()

  return {
    ...resolveCommandOutputBase(results),
    results,
    timer,
    stageName,
  }
}
