import { CommandStatus } from "@takomo/core"
import { executeHooks } from "../../../hook"
import { HookOperation, HookStatus } from "../../../hook/model"
import { StackResult } from "../../../model"
import { ResultHolder, StackLaunchType, StackLaunchTypeHolder } from "./model"
import { prepareCloudFormationTemplate } from "./template"

const toHookOperation = (launchType: StackLaunchType): HookOperation => {
  switch (launchType) {
    case StackLaunchType.CREATE:
      return "create"
    case StackLaunchType.UPDATE:
      return "update"
    default:
      throw new Error(`Unsupported launch type: ${launchType}`)
  }
}

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

export const executeBeforeLaunchHooks = async (
  holder: StackLaunchTypeHolder,
): Promise<StackResult> => {
  const { stack, watch, launchType, ctx, variables, logger } = holder
  const childWatch = watch.startChild("before-hooks")

  logger.debug("Execute before launch hooks")

  const { success, message } = await executeHooks(
    ctx,
    variables,
    stack.getHooks(),
    toHookOperation(launchType),
    "before",
    logger,
  )

  if (!success) {
    logger.error(`Before launch hooks failed with message: ${message}`)
    return {
      stack,
      message,
      status: CommandStatus.FAILED,
      reason: "BEFORE_HOOKS_FAILED",
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }

  childWatch.stop()
  logger.debug("Execute before launch hooks completed")

  return prepareCloudFormationTemplate(holder)
}

export const executeAfterLaunchHooks = async (
  holder: ResultHolder,
): Promise<StackResult> => {
  const { stack, watch, launchType, result, ctx, variables, logger } = holder
  const childWatch = watch.startChild("after-hooks")

  logger.debug("Execute after launch hooks")

  const { success, message } = await executeHooks(
    ctx,
    variables,
    stack.getHooks(),
    toHookOperation(launchType),
    "after",
    logger,
    toHookStatus(result.status),
  )

  childWatch.stop()

  if (!success) {
    logger.error(`After launch hooks failed with message: ${message}`)
    return {
      ...result,
      message,
      status: CommandStatus.FAILED,
      reason: "AFTER_HOOKS_FAILED",
      success: false,
      watch: watch.stop(),
    }
  }

  logger.debug("Execute after launch hooks completed")
  return {
    ...result,
    watch: watch.stop(),
  }
}
