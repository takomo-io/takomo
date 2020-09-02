import { CloudFormationClient } from "@takomo/aws-clients"
import { StackPath } from "@takomo/core"
import { CommandContext, Stack } from "@takomo/stacks-model"
import { TakomoError } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import uuid from "uuid"
import { DeployStacksIO } from "./model"

const isStackStatusInvalid = (status: CloudFormation.StackStatus): boolean =>
  ["CREATE_FAILED", "ROLLBACK_COMPLETE", "REVIEW_IN_PROGRESS"].includes(status)

const cleanStack = async (
  io: DeployStacksIO,
  stack: Stack,
  existing: CloudFormation.Stack,
): Promise<boolean> => {
  const cf = new CloudFormationClient({
    credentialProvider: stack.getCredentialProvider(),
    region: stack.getRegion(),
    logger: io,
  })

  const token = uuid.v4()
  io.debugObject("Delete stack with invalid status:", {
    path: stack.getPath(),
    name: stack.getName(),
  })

  return cf
    .initiateStackDeletion({
      StackName: existing.StackName,
      ClientRequestToken: token,
    })
    .then(() =>
      cf.waitUntilStackIsDeleted(
        existing.StackName,
        existing.StackId!,
        token,
        (e: CloudFormation.StackEvent) =>
          io.printStackEvent(stack.getPath(), e),
      ),
    )
    .then(() => true)
}

export const cleanStacksWithInvalidStatus = async (
  ctx: CommandContext,
  io: DeployStacksIO,
): Promise<CommandContext> => {
  const failed = new Array<StackPath>()
  const success = new Array<StackPath>()
  io.debug("Delete stacks with invalid status")

  await Promise.all(
    ctx.getStacksToProcess().map(async (stack) => {
      const existing = await ctx.getExistingStack(stack.getPath())
      if (existing && isStackStatusInvalid(existing.StackStatus!)) {
        try {
          io.info(`Delete stack with invalid status: ${stack.getPath()}`)
          await cleanStack(io, stack, existing)
          io.info(
            `Stack with invalid status deleted successfully: ${stack.getPath()}`,
          )
          success.push(stack.getPath())
          ctx.removeExistingStack(stack.getPath())
          ctx.removeExistingTemplateSummary(stack.getPath())
        } catch (e) {
          io.error(
            `Failed to delete stack with invalid status: ${stack.getPath()}`,
            e,
          )
          failed.push(stack.getPath())
          return false
        }
      }

      return true
    }),
  )

  if (failed.length > 0) {
    const failedString = failed.map((s) => `  - ${s}`).join("\n")
    throw new TakomoError(
      `Failed to clean following stacks with invalid status:\n\n${failedString}`,
    )
  }

  if (success.length > 0) {
    io.debug(
      `Successfully cleaned ${success.length} stacks with invalid status`,
    )
  } else {
    io.debug("No stacks with invalid status to clean")
  }

  return ctx
}
