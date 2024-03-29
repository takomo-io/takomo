import { InternalCredentialManager } from "../../../aws/common/credentials.js"
import { ConfigSetContext } from "../../../config-sets/config-set-model.js"
import {
  CommandOutput,
  OperationState,
  resolveCommandOutputBase,
} from "../../../takomo-core/command.js"
import { TkmLogger } from "../../../utils/logging.js"
import { Timer } from "../../../utils/timer.js"
import {
  ConfigSetExecutionPlan,
  ConfigSetPlanExecutionResult,
  ConfigSetStageExecutionResult,
  ConfigSetTargetExecutor,
  ConfigSetTargetListenerProvider,
} from "../model.js"
import { executeStage } from "./stage.js"

export interface ExecuteConfigSetPlanProps<R extends CommandOutput, C> {
  readonly plan: ConfigSetExecutionPlan<C>
  readonly logger: TkmLogger
  readonly timer: Timer
  readonly state: OperationState
  readonly ctx: ConfigSetContext
  readonly executor: ConfigSetTargetExecutor<R, C>
  readonly concurrentTargets: number
  readonly targetListenerProvider: ConfigSetTargetListenerProvider
  readonly defaultCredentialManager: InternalCredentialManager
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

  return {
    ...resolveCommandOutputBase(results),
    results,
    timer: timer.stop(),
    outputFormat: "text",
  }
}
