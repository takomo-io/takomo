import { CommandContext } from "@takomo/stacks-model"
import { TakomoError } from "@takomo/util"
import { CloudFormation } from "aws-sdk"

export const isStackReadyForUndeploy = (
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
    "IMPORT_ROLLBACK_FAILED",
    "IMPORT_COMPLETE",
    "IMPORT_ROLLBACK_COMPLETE",
  ].includes(stackStatus)

const validateStackStatus = async (ctx: CommandContext): Promise<void> => {
  const stacks = []
  for (const stack of ctx.getStacksToProcess()) {
    const existing = await ctx.getExistingStack(stack.getPath())
    if (existing && !isStackReadyForUndeploy(existing.StackStatus!)) {
      stacks.push({ stack, existing })
    }
  }

  if (stacks.length > 0) {
    throw new TakomoError(
      "Can't undeploy stacks because following stacks are in invalid status:\n\n" +
        stacks
          .map(
            (s) =>
              `  - ${s.stack.getPath()} in invalid status: ${
                s.existing.StackStatus
              }`,
          )
          .join("\n"),
    )
  }
}

const validateTerminationProtection = async (
  ctx: CommandContext,
): Promise<void> => {
  const stacks = []
  for (const stack of ctx.getStacksToProcess()) {
    const existing = await ctx.getExistingStack(stack.getPath())
    if (existing && existing.EnableTerminationProtection === true) {
      stacks.push({ stack, existing })
    }
  }

  if (stacks.length > 0) {
    throw new TakomoError(
      "Can't undeploy stacks because following stacks have termination protection enabled:\n\n" +
        stacks.map((s) => `  - ${s.stack.getPath()}`).join("\n"),
    )
  }
}

export const validateUndeployContext = async (
  ctx: CommandContext,
): Promise<CommandContext> => {
  await validateStackStatus(ctx)
  await validateTerminationProtection(ctx)
  return ctx
}
