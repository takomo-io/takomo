import { CommandStatus } from "@takomo/core"
import { StackResult } from "@takomo/stacks"
import { InitialDeleteContext } from "./model"
import { validateCloudFormationStackStatus } from "./validate"

export const describeExistingCloudFormationStack = async (
  holder: InitialDeleteContext,
): Promise<StackResult> => {
  const { stack, cloudFormationClient, watch, logger } = holder
  const childWatch = watch.startChild("describe-stack")

  logger.debug("Describe existing stack")

  try {
    const existingStack = await cloudFormationClient.describeStack(
      stack.getName(),
    )
    if (!existingStack) {
      logger.debug("No existing stack found")
      return {
        stack,
        message: "Stack not found",
        reason: "DELETE_SKIPPED",
        status: CommandStatus.SKIPPED,
        events: [],
        success: true,
        watch: watch.stop(),
      }
    }

    const { StackId, StackStatus } = existingStack
    logger.debugObject("Found existing stack:", {
      stackId: StackId,
      status: StackStatus,
    })

    childWatch.stop()
    return validateCloudFormationStackStatus({
      ...holder,
      current: {
        stackId: StackId!,
        status: StackStatus!,
      },
    })
  } catch (e) {
    logger.error("An error occurred while describing the existing stack", e)
    return {
      stack,
      message: e.message,
      reason: "DESCRIBE_STACK_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }
}
