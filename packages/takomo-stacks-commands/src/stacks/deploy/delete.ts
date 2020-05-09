import { CommandStatus, ConfirmResult } from "@takomo/core"
import { StackResult } from "@takomo/stacks"
import uuid from "uuid"
import { TargetStackInfoHolder } from "./model"
import { waitStackDeletionToComplete } from "./wait"

export const initiateFailedCloudFormationStackDeletion = async (
  holder: TargetStackInfoHolder,
): Promise<StackResult> => {
  const {
    ctx,
    stack,
    current,
    cloudFormationClient,
    io,
    watch,
    logger,
  } = holder

  logger.debug(
    "Previous attempt to create the stack has failed and stack needs to be re-created",
  )

  if (
    !ctx.getOptions().isAutoConfirmEnabled() &&
    (await io.confirmDeleteOfFailedStack(stack)) !== ConfirmResult.YES
  ) {
    logger.debug("Deletion of failed stack cancelled")
    return {
      stack,
      message: "Launch cancelled",
      reason: "CANCELLED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }

  const childWatch = watch.startChild("initiate-failed-stack-deletion")
  const clientToken = uuid.v4()

  try {
    logger.debug(`Initiate stack deletion with client token ${clientToken}`)
    await cloudFormationClient.initiateStackDeletion({
      StackName: current.stackId,
      ClientRequestToken: clientToken,
    })

    logger.debug("Stack deletion initiated successfully")
    childWatch.stop()
    return await waitStackDeletionToComplete({
      clientToken,
      ...holder,
    })
  } catch (e) {
    logger.error("Failed to initiate deletion of stack", e)
    return {
      stack,
      message: "Initiate stack deletion failed",
      reason: "INITIATE_DELETE_STACK_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }
}
