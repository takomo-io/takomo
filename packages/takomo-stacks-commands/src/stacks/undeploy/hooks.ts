import { CommandStatus } from "@takomo/core"
import { executeHooks } from "@takomo/stacks-hooks"
import { HookStatus, StackResult } from "@takomo/stacks-model"
import { deleteSecrets } from "./delete"
import { InitialDeleteContext, ResultHolder } from "./model"

const toHookStatus = (commandStatus: CommandStatus): HookStatus => {
  switch (commandStatus) {
    case CommandStatus.CANCELLED:
      return "cancelled"
    case CommandStatus.SKIPPED:
      return "skipped"
    case CommandStatus.SUCCESS:
      return "success"
    case CommandStatus.FAILED:
      return "failed"
    default:
      throw new Error(`Unsupported command status: ${commandStatus}`)
  }
}

export const executeBeforeDeleteHooks = async (
  holder: InitialDeleteContext,
): Promise<StackResult> => {
  const { stack, watch, ctx, variables, logger } = holder
  const childWatch = watch.startChild("before-hooks")

  logger.debug("Execute before delete hooks")

  const { success, message } = await executeHooks(
    ctx,
    variables,
    stack.getHooks(),
    "delete",
    "before",
    logger,
  )

  if (!success) {
    logger.debug(`Before delete hooks failed with message: ${message}`)
    return {
      stack,
      message: message,
      reason: "BEFORE_HOOKS_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }

  logger.debug("Execute before delete hooks completed")
  childWatch.stop()

  return deleteSecrets(holder)
}

export const executeAfterDeleteHooks = async (
  holder: ResultHolder,
): Promise<StackResult> => {
  const { stack, watch, result, ctx, variables, logger } = holder
  watch.startChild("after-hooks")

  logger.debug("Execute after delete hooks")

  const { success, message } = await executeHooks(
    ctx,
    variables,
    stack.getHooks(),
    "delete",
    "after",
    logger,
    toHookStatus(result.status),
  )

  if (!success) {
    logger.debug(`After delete hooks failed with message: ${message}`)
    return {
      ...result,
      message,
      status: CommandStatus.FAILED,
      reason: "AFTER_HOOKS_FAILED",
      success: false,
      watch: watch.stop(),
    }
  }

  logger.debug("Execute after delete hooks completed")
  return {
    ...result,
    watch: watch.stop(),
  }
}
