import { CredentialManager } from "../../../takomo-aws-clients"
import { ConfigSetContext } from "../../../takomo-config-sets"
import {
  CommandOutput,
  OperationState,
  resolveCommandOutputBase,
} from "../../../takomo-core"
import { Timer, TkmLogger } from "../../../takomo-util"
import {
  ConfigSetExecutionPlan,
  ConfigSetPlanExecutionResult,
  ConfigSetStageExecutionResult,
  ConfigSetTargetExecutor,
  ConfigSetTargetListenerProvider,
} from "../model"
import { executeStage } from "./stage"

export interface ExecuteConfigSetPlanProps<R extends CommandOutput, C> {
  readonly plan: ConfigSetExecutionPlan<C>
  readonly logger: TkmLogger
  readonly timer: Timer
  readonly state: OperationState
  readonly ctx: ConfigSetContext
  readonly executor: ConfigSetTargetExecutor<R, C>
  readonly concurrentTargets: number
  readonly targetListenerProvider: ConfigSetTargetListenerProvider
  readonly defaultCredentialManager: CredentialManager
}

export const executeConfigSetPlan = async <R extends CommandOutput, C>({
  logger,
  plan,
  timer,
  executor,
  concurrentTargets,
  ctx,
  state,
  targetListenerProvider,
  defaultCredentialManager,
}: ExecuteConfigSetPlanProps<R, C>): Promise<
  ConfigSetPlanExecutionResult<R>
> => {
  const stageCount = plan.stages.length

  const results = new Array<ConfigSetStageExecutionResult<R>>()
  for (const [currentStageNumber, stage] of plan.stages.entries()) {
    const result = await executeStage<R, C>({
      stage,
      logger,
      ctx,
      executor,
      state,
      concurrentTargets,
      stageCount,
      targetListenerProvider,
      defaultCredentialManager,
      currentStageNumber: currentStageNumber + 1,
      timer: timer.startChild(stage.stageName),
    })
    results.push(result)
  }

  timer.stop()
  return {
    ...resolveCommandOutputBase(results),
    results,
    timer,
    outputFormat: "text",
  }
}
