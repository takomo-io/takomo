import { CredentialManager } from "@takomo/aws-clients"
import { CommandOutput, OperationState } from "@takomo/core"
import { CommandPath } from "@takomo/stacks-model"
import { Timer, TkmLogger } from "@takomo/util"
import {
  CommandPathExecutionResult,
  ConfigSet,
  ConfigSetName,
  ExecutionTarget,
  TargetExecutor,
} from "../model"

export interface ExecuteCommandPathProps<R extends CommandOutput, C> {
  readonly target: ExecutionTarget<C>
  readonly configSetName: ConfigSetName
  readonly commandPath: CommandPath
  readonly timer: Timer
  readonly state: OperationState
  readonly executor: TargetExecutor<R, C>
  readonly logger: TkmLogger
  readonly defaultCredentialManager: CredentialManager
  readonly configSet: ConfigSet
}

export const executeCommandPath = async <R extends CommandOutput, C>({
  timer,
  commandPath,
  executor,
  target,
  configSetName,
  state,
  logger,
  defaultCredentialManager,
  configSet,
}: ExecuteCommandPathProps<R, C>): Promise<CommandPathExecutionResult<R>> => {
  // try {
  const result = await executor({
    commandPath,
    defaultCredentialManager,
    target,
    configSet,
    state,
    timer: timer.startChild(target.id),
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
