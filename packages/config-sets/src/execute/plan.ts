import { CredentialManager } from "@takomo/aws-clients"
import { CommandOutput, OperationState } from "@takomo/core"
import { CommandPath } from "@takomo/stacks-model"
import { Timer, TkmLogger } from "@takomo/util"
import {
  ConfigSetContext,
  ConfigSetType,
  ExecutionPlan,
  PlanExecutionResult,
  StageExecutionResult,
  TargetExecutor,
  TargetListenerProvider,
} from "../model"
import { executeStage } from "./stage"

export interface ExecutePlanProps<R extends CommandOutput, C> {
  readonly plan: ExecutionPlan<C>
  readonly logger: TkmLogger
  readonly timer: Timer
  readonly state: OperationState
  readonly configSetType: ConfigSetType
  readonly ctx: ConfigSetContext
  readonly commandPath?: CommandPath
  readonly executor: TargetExecutor<R, C>
  readonly concurrentAccounts: number
  readonly targetListenerProvider: TargetListenerProvider
  readonly defaultCredentialManager: CredentialManager
}

export const executePlan = async <R extends CommandOutput, C>({
  logger,
  plan,
  timer,
  executor,
  concurrentAccounts,
  ctx,
  state,
  targetListenerProvider,
  defaultCredentialManager,
}: ExecutePlanProps<R, C>): Promise<PlanExecutionResult<R>> => {
  const stageCount = plan.stages.length

  const results = new Array<StageExecutionResult<R>>()
  for (const [currentStageNumber, stage] of plan.stages.entries()) {
    const result = await executeStage<R, C>({
      stage,
      logger,
      ctx,
      executor,
      state,
      concurrentAccounts,
      currentStageNumber,
      stageCount,
      targetListenerProvider,
      defaultCredentialManager,
    })
    results.push(result)
  }

  timer.stop()
  return {
    results,
    timer,
    message: "Success",
    status: "SUCCESS",
    success: true,
    outputFormat: "text",
  }
}
