import { InternalCredentialManager } from "../../../takomo-aws-clients"
import { ConfigSet } from "../../../takomo-config-sets"
import { CommandOutput, OperationState } from "../../../takomo-core"
import { CommandPath } from "../../../takomo-stacks-model"
import { Timer, TkmLogger } from "../../../takomo-util"
import {
  CommandPathExecutionResult,
  ConfigSetExecutionTarget,
  ConfigSetTargetExecutor,
} from "../model"

export interface ExecuteCommandPathProps<R extends CommandOutput, C> {
  readonly target: ConfigSetExecutionTarget<C>
  readonly commandPath: CommandPath
  readonly timer: Timer
  readonly state: OperationState
  readonly executor: ConfigSetTargetExecutor<R, C>
  readonly logger: TkmLogger
  readonly defaultCredentialManager: InternalCredentialManager
  readonly configSet: ConfigSet
}

export const executeCommandPath = async <R extends CommandOutput, C>({
  timer,
  commandPath,
  executor,
  target,
  state,
  logger,
  defaultCredentialManager,
  configSet,
}: ExecuteCommandPathProps<R, C>): Promise<CommandPathExecutionResult<R>> => {
  logger.info(`Execute command path: ${commandPath}`)
  const result = await executor({
    commandPath,
    defaultCredentialManager,
    target,
    configSet,
    state,
    logger,
    timer,
  })

  timer.stop()
  return {
    result,
    commandPath,
    timer,
    status: result.status,
    success: result.success,
    message: result.message,
  }
}
