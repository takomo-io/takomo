import { InternalCredentialManager } from "../../../takomo-aws-clients"
import { ConfigSetContext } from "../../../takomo-config-sets"
import {
  CommandOutput,
  OperationState,
  resolveCommandOutputBase,
} from "../../../takomo-core"
import { TkmLogger } from "../../../utils/logging"
import { Timer } from "../../../utils/timer"
import {
  ConfigSetExecutionResult,
  ConfigSetExecutionTarget,
  ConfigSetTargetExecutionResult,
  ConfigSetTargetExecutor,
} from "../model"
import { executeConfigSet } from "./config-set"

export interface ExecuteTargetProps<R extends CommandOutput, C> {
  readonly executor: ConfigSetTargetExecutor<R, C>
  readonly target: ConfigSetExecutionTarget<C>
  readonly state: OperationState
  readonly logger: TkmLogger
  readonly ctx: ConfigSetContext
  readonly timer: Timer
  readonly defaultCredentialManager: InternalCredentialManager
}

export const executeTarget = async <R extends CommandOutput, C>({
  target,
  logger,
  timer,
  state,
  executor,
  ctx,
  defaultCredentialManager,
}: ExecuteTargetProps<R, C>): Promise<ConfigSetTargetExecutionResult<R>> => {
  const results = new Array<ConfigSetExecutionResult<R>>()

  for (const configSet of target.configSets) {
    const result = await executeConfigSet<R, C>({
      target,
      configSet,
      state,
      executor,
      ctx,
      logger,
      defaultCredentialManager,
      timer: timer.startChild(configSet.name),
    })
    results.push(result)
  }

  return {
    ...resolveCommandOutputBase(results),
    results,
    targetId: target.id,
    timer: timer.stop(),
  }
}
