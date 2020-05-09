import { CommandStatus } from "@takomo/core"
import { StackResult } from "@takomo/stacks"
import { CloudFormation } from "aws-sdk"
import { deleteSecrets } from "./delete"
import { executeAfterDeleteHooks } from "./hooks"
import { ClientTokenHolder, InitialDeleteContext } from "./model"

export const waitForDependantsToComplete = async (
  initial: InitialDeleteContext,
): Promise<StackResult> => {
  const { stack, dependants, watch, logger } = initial
  const childWatch = watch.startChild("wait-dependants")

  logger.debug(`Wait ${dependants.length} dependants to complete`)

  try {
    const dependantResults = await Promise.all(dependants)

    const allDependantsSucceeded =
      dependantResults.find((r) => !r.success) === undefined

    if (!allDependantsSucceeded) {
      logger.warn("Some dependants failed")
      return {
        stack,
        message: "Dependants failed",
        reason: "DEPENDANTS_FAILED",
        status: CommandStatus.CANCELLED,
        events: [],
        success: false,
        watch: watch.stop(),
      }
    }

    logger.debug("Dependants completed successfully")
  } catch (e) {
    logger.error("An error occurred while waiting dependants to complete", e)

    return {
      stack,
      message: e.message,
      reason: "DEPENDANTS_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }

  childWatch.stop()
  return deleteSecrets(initial)
}

export const waitCloudFormationStackDeletionToComplete = async (
  holder: ClientTokenHolder,
): Promise<StackResult> => {
  const {
    stack,
    current,
    cloudFormationClient,
    io,
    watch,
    clientToken,
    logger,
  } = holder
  const childWatch = watch.startChild("wait-deletion-to-complete")
  logger.debug("Wait for stack delete to complete")

  try {
    const {
      events,
      stackStatus,
    } = await cloudFormationClient.waitUntilStackIsDeleted(
      stack.getName(),
      current.stackId,
      clientToken,
      (e: CloudFormation.StackEvent) => io.printStackEvent(stack.getPath(), e),
    )

    logger.debug(`Stack delete completed with status ${stackStatus}`)

    const success = stackStatus === "DELETE_COMPLETE"
    const reason = success ? "DELETE_SUCCESS" : "DELETE_FAILED"
    const message = success ? "Success" : "Failed"
    const status = success ? CommandStatus.SUCCESS : CommandStatus.FAILED

    const result = {
      stack,
      message,
      status,
      reason,
      events,
      success,
      watch: watch,
    }

    childWatch.stop()
    return executeAfterDeleteHooks({
      ...holder,
      result,
    })
  } catch (e) {
    logger.error(
      "An error occurred while waiting for stack deletion to complete",
      e,
    )
    return {
      stack,
      message: "Stack deletion failed",
      reason: "DELETE_STACK_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }
}
