import { CredentialManager } from "@takomo/aws-clients"
import { ConfigSetContext } from "@takomo/config-sets"
import {
  CommandOutput,
  OperationState,
  resolveCommandOutputBase,
} from "@takomo/core"
import { Timer, TkmLogger } from "@takomo/util"
import {
  ConfigSetExecutionStage,
  ConfigSetGroupExecutionResult,
  ConfigSetStageExecutionResult,
  ConfigSetTargetExecutor,
  ConfigSetTargetListenerProvider,
} from "../model"
import { executeGroup } from "./group"

interface ExecuteStageProps<R extends CommandOutput, C> {
  readonly stage: ConfigSetExecutionStage<C>
  readonly logger: TkmLogger
  readonly state: OperationState
  readonly ctx: ConfigSetContext
  readonly executor: ConfigSetTargetExecutor<R, C>
  readonly concurrentTargets: number
  readonly currentStageNumber: number
  readonly stageCount: number
  readonly targetListenerProvider: ConfigSetTargetListenerProvider
  readonly defaultCredentialManager: CredentialManager
  readonly timer: Timer
}

export const executeStage = async <R extends CommandOutput, C>({
  stage,
  logger,
  executor,
  state,
  concurrentTargets,
  targetListenerProvider,
  ctx,
  currentStageNumber,
  stageCount,
  defaultCredentialManager,
  timer,
}: ExecuteStageProps<R, C>): Promise<ConfigSetStageExecutionResult<R>> => {
  const stageName = stage.stageName
  logger.info(`Begin stage '${stageName}'`)

  const targetCount = stage.groups.map((g) => g.targets).flat().length

  const targetListener = targetListenerProvider({
    stageName,
    currentStageNumber,
    stageCount,
    targetCount,
  })

  const results = new Array<ConfigSetGroupExecutionResult<R>>()
  for (const group of stage.groups) {
    const result = await executeGroup<R, C>({
      group,
      ctx,
      executor,
      targetListener,
      state,
      concurrentTargets,
      defaultCredentialManager,
      timer: timer.startChild(group.id),
      logger: logger.childLogger(group.id),
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
