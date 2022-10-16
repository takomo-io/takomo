import {
  CredentialManager,
  InternalCredentialManager,
} from "../../../takomo-aws-clients"
import { ConfigSetContext } from "../../../takomo-config-sets"
import {
  CommandOutput,
  OperationState,
  resolveCommandOutputBase,
} from "../../../takomo-core"
import { Timer, TkmLogger } from "../../../takomo-util"
import {
  CommandPathExecutionResult,
  ConfigSetExecution,
  ConfigSetExecutionResult,
  ConfigSetExecutionTarget,
  ConfigSetTargetExecutor,
} from "../model"
import { executeCommandPath } from "./command-path"

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

  timer.stop()
  return {
    ...resolveCommandOutputBase(results),
    configSetName: executionConfigSet.name,
    results,
    timer,
  }
}
