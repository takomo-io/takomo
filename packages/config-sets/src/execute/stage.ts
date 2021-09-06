import { CredentialManager } from "@takomo/aws-clients"
import { CommandOutput, OperationState } from "@takomo/core"
import { createTimer, TkmLogger } from "@takomo/util"
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
}: ExecuteStageProps<R, C>): Promise<StageExecutionResult<R>> => {
  const stageName = stage.stageName
  logger.info(`Begin stage '${stageName}'`)
  const timer = createTimer(stageName)

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
      logger,
      ctx,
      executor,
      targetListener,
      state,
      timer,
      concurrentAccounts,
      defaultCredentialManager,
    })
    results.push(result)
  }

  timer.stop()

  return {
    results,
    timer,
    stageName,
    success: true,
    status: "SUCCESS",
    message: "Success",
  }
}
