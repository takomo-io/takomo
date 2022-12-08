import { InternalCredentialManager } from "../../../aws/common/credentials"
import { CommandPath } from "../../../command/command-model"
import { ConfigSet } from "../../../config-sets/config-set-model"
import { CommandOutput, OperationState } from "../../../takomo-core/command"
import { TkmLogger } from "../../../utils/logging"
import { Timer } from "../../../utils/timer"
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

  return {
    result,
    commandPath,
    timer: timer.stop(),
    status: result.status,
    success: result.success,
    message: result.message,
  }
}
