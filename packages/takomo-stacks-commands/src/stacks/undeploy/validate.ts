import { CommandContext } from "@takomo/stacks"
import { TakomoError } from "@takomo/util"
import { CloudFormation } from "aws-sdk"

export const isStackReadyForDelete = (
  stackStatus: CloudFormation.StackStatus,
): boolean =>
  [
    "ROLLBACK_COMPLETE",
    "CREATE_FAILED",
    "DELETE_FAILED",
    "CREATE_COMPLETE",
    "ROLLBACK_FAILED",
    "UPDATE_COMPLETE",
    "UPDATE_ROLLBACK_COMPLETE",
    "REVIEW_IN_PROGRESS",
  ].includes(stackStatus)

// export const validateCloudFormationStackStatus = async (
//   holder: TargetStackInfoHolder,
// ): Promise<StackResult> => {
//   const { stack, current, watch, logger } = holder
//   const childWatch = watch.startChild("validate-stack-status")

//   logger.debug("Validate stack status")

//   if (!validStatuses.includes(current.status)) {
//     logger.warn(`Stack status ${current.status} is not valid`)

//     return {
//       stack,
//       message: `Invalid stack status ${current.status}`,
//       reason: "CHECK_STACK_STATUS_FAILED",
//       status: CommandStatus.FAILED,
//       events: [],
//       success: false,
//       watch: watch.stop(),
//     }
//   }

//   childWatch.stop()
//   logger.debug(`Stack status ${current.status} is valid`)
//   return executeBeforeDeleteHooks(holder)
// }

export const validateDeleteContext = async (
  ctx: CommandContext,
): Promise<CommandContext> => {
  const stacksInInvalidStatus = []
  for (const stack of ctx.getStacksToProcess()) {
    const existing = await ctx.getExistingStack(stack.getPath())
    if (existing && !isStackReadyForDelete(existing.StackStatus!)) {
      stacksInInvalidStatus.push({ stack, existing })
    }
  }

  if (stacksInInvalidStatus.length > 0) {
    throw new TakomoError(
      "Can't undeploy stacks because following stacks are in invalid status:\n\n" +
        stacksInInvalidStatus
          .map(
            (s) =>
              `  - ${s.stack.getPath()} in invalid status: ${
                s.existing.StackStatus
              }`,
          )
          .join("\n"),
    )
  }

  return ctx
}
