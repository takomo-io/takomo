import { CommandStatus } from "@takomo/core"
import { StackStatus } from "aws-sdk/clients/cloudformation"
import { StackResult } from "../../../model"
import { executeBeforeLaunchHooks } from "./hooks"
import { InitialLaunchContext, StackLaunchType } from "./model"
import { validateCloudFormationStackStatus } from "./validate"

export const resolveStackLaunchType = (
  status: StackStatus,
): StackLaunchType => {
  switch (status) {
    case "CREATE_COMPLETE":
    case "UPDATE_COMPLETE":
    case "UPDATE_ROLLBACK_COMPLETE":
      return StackLaunchType.UPDATE
    case "CREATE_FAILED":
    case "ROLLBACK_COMPLETE":
    case "REVIEW_IN_PROGRESS":
      return StackLaunchType.CREATE
    default:
      throw new Error(`Unsupported stack status: ${status}`)
  }
}

export const describeExistingCloudFormationStack = async (
  holder: InitialLaunchContext,
): Promise<StackResult> => {
  const { stack, cloudFormationClient, watch, logger } = holder

  const childWatch = watch.startChild("describe-existing-stack")

  logger.debug("Describe existing stack")

  try {
    const existingStack = await cloudFormationClient.describeStack(
      stack.getName(),
    )
    if (existingStack) {
      const { StackId, StackStatus } = existingStack
      logger.debugObject("Found existing stack:", {
        stackId: StackId,
        status: StackStatus,
      })

      childWatch.stop()

      return validateCloudFormationStackStatus({
        ...holder,
        launchType: resolveStackLaunchType(StackStatus!),
        current: {
          stackId: StackId!,
          status: StackStatus!,
        },
      })
    }

    logger.debug("Stack does not exists")

    return executeBeforeLaunchHooks({
      ...holder,
      launchType: StackLaunchType.CREATE,
    })
  } catch (e) {
    logger.error("An error occurred while describing existing stack", e)
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
