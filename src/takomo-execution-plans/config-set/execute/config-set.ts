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
  CommandPathExecutionResult,
  ConfigSetExecution,
  ConfigSetExecutionResult,
  ConfigSetExecutionTarget,
  ConfigSetTargetExecutor,
} from "../model.js"
import { executeCommandPath } from "./command-path.js"

export interface ExecuteConfigSetProps<R extends CommandOutput, C> {
  readonly executor: ConfigSetTargetExecutor<R, C>
  readonly target: ConfigSetExecutionTarget<C>
  readonly configSet: ConfigSetExecution
  readonly timer: Timer
  readonly state: OperationState
  readonly logger: TkmLogger
  readonly ctx: ConfigSetContext
  readonly defaultCredentialManager: InternalCredentialManager
}

export const executeConfigSet = async <R extends CommandOutput, C>({
  configSet: executionConfigSet,
  timer,
  state,
  logger,
  ctx,
  executor,
  target,
  defaultCredentialManager,
}: ExecuteConfigSetProps<R, C>): Promise<ConfigSetExecutionResult<R>> => {
  logger.info(`Begin config set: '${executionConfigSet.name}'`)
  const configSet = ctx.getConfigSet(executionConfigSet.name)
  const results = new Array<CommandPathExecutionResult<R>>()

  for (const commandPath of executionConfigSet.commandPaths) {
    const result = await executeCommandPath<R, C>({
      target,
      commandPath,
      state,
      executor,
      logger,
      defaultCredentialManager,
      configSet,
      timer: timer.startChild(commandPath),
    })

    if (!result.success) {
      state.failed = true
    }

    results.push(result)
  }

  return {
    ...resolveCommandOutputBase(results),
    configSetName: executionConfigSet.name,
    results,
    timer: timer.stop(),
  }
}
