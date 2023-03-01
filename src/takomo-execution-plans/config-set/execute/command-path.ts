import { InternalCredentialManager } from "../../../aws/common/credentials.js"
import { CommandPath } from "../../../command/command-model.js"
import { ConfigSet } from "../../../config-sets/config-set-model.js"
import { CommandOutput, OperationState } from "../../../takomo-core/command.js"
import { TkmLogger } from "../../../utils/logging.js"
import { Timer } from "../../../utils/timer.js"
import {
  CommandPathExecutionResult,
  ConfigSetExecutionTarget,
  ConfigSetTargetExecutor,
} from "../model.js"

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

  return {
    result,
    commandPath,
    timer: timer.stop(),
    status: result.status,
    success: result.success,
    message: result.message,
  }
}
