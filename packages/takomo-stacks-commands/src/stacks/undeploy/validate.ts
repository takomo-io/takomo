import { CommandContext } from "@takomo/stacks-model"
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
