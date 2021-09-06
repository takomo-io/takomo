import { CredentialManager } from "@takomo/aws-clients"
import {
  CommandOutput,
  OperationState,
  resolveCommandOutputBase,
} from "@takomo/core"
import { Timer, TkmLogger } from "@takomo/util"
import {
  ConfigSetContext,
  ConfigSetExecutionResult,
  ExecutionTarget,
  TargetExecutionResult,
  TargetExecutor,
} from "../model"
import { executeConfigSet } from "./config-set"

export interface ExecuteAccountProps<R extends CommandOutput, C> {
  readonly executor: TargetExecutor<R, C>
  readonly target: ExecutionTarget<C>
  readonly state: OperationState
  readonly logger: TkmLogger
  readonly ctx: ConfigSetContext
  readonly timer: Timer
  readonly defaultCredentialManager: CredentialManager
}

export const executeAccount = async <R extends CommandOutput, C>({
  target,
  logger,
  timer,
  state,
  executor,
  ctx,
  defaultCredentialManager,
}: ExecuteAccountProps<R, C>): Promise<TargetExecutionResult<R>> => {
  logger.info(`Process target: '${target.id}'`)
  const results = new Array<ConfigSetExecutionResult<R>>()

  for (const configSetName of target.configSets) {
    const result = await executeConfigSet<R, C>({
      target,
      configSetName,
      state,
      timer: timer.startChild(configSetName),
      executor,
      ctx,
      logger,
      defaultCredentialManager,
    })
    results.push(result)
  }

  timer.stop()

  return {
    ...resolveCommandOutputBase(results),
    results,
    targetId: target.id,
    timer,
  }
}
