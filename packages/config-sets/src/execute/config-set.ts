import { CredentialManager } from "@takomo/aws-clients"
import {
  CommandOutput,
  OperationState,
  resolveCommandOutputBase,
} from "@takomo/core"
import { Timer, TkmLogger } from "@takomo/util"
import {
  CommandPathExecutionResult,
  ConfigSetContext,
  ConfigSetExecutionResult,
  ConfigSetName,
  ExecutionTarget,
  TargetExecutor,
} from "../model"
import { executeCommandPath } from "./command-path"

export interface ExecuteConfigSetProps<R extends CommandOutput, C> {
  readonly executor: TargetExecutor<R, C>
  readonly target: ExecutionTarget<C>
  readonly configSetName: ConfigSetName
  readonly timer: Timer
  readonly state: OperationState
  readonly logger: TkmLogger
  readonly ctx: ConfigSetContext
  readonly defaultCredentialManager: CredentialManager
}

export const executeConfigSet = async <R extends CommandOutput, C>({
  configSetName,
  timer,
  state,
  logger,
  ctx,
  executor,
  target,
  defaultCredentialManager,
}: ExecuteConfigSetProps<R, C>): Promise<ConfigSetExecutionResult<R>> => {
  logger.info(`Process config set: '${configSetName}'`)
  const configSet = ctx.getConfigSet(configSetName)
  const results = new Array<CommandPathExecutionResult<R>>()

  for (const commandPath of configSet.commandPaths) {
    const result = await executeCommandPath<R, C>({
      target,
      configSetName,
      commandPath,
      timer: timer.startChild(commandPath),
      state,
      executor,
      logger,
      defaultCredentialManager,
      configSet,
    })

    if (!result.success) {
      state.failed = true
    }

    results.push(result)
  }

  timer.stop()
  return {
    ...resolveCommandOutputBase(results),
    configSetName,
    results,
    timer,
  }
}
