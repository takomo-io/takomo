import { CommandStatus } from "@takomo/core"
import { StackResult } from "../../../model"
import { executeBeforeDeleteHooks } from "./hooks"
import { TargetStackInfoHolder } from "./model"

export const validateCloudFormationStackStatus = async (
  holder: TargetStackInfoHolder,
): Promise<StackResult> => {
  const { stack, current, watch, logger } = holder
  const childWatch = watch.startChild("validate-stack-status")

  logger.debug("Validate stack status")

  const validStatuses = [
    "ROLLBACK_COMPLETE",
    "CREATE_FAILED",
    "DELETE_FAILED",
    "CREATE_COMPLETE",
    "ROLLBACK_FAILED",
    "UPDATE_COMPLETE",
    "UPDATE_ROLLBACK_COMPLETE",
    "REVIEW_IN_PROGRESS",
  ]

  if (!validStatuses.includes(current.status)) {
    logger.warn(`Stack status ${current.status} is not valid`)

    return {
      stack,
      message: `Invalid stack status ${current.status}`,
      reason: "CHECK_STACK_STATUS_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }

  childWatch.stop()
  logger.debug(`Stack status ${current.status} is valid`)
  return executeBeforeDeleteHooks(holder)
}
