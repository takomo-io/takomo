import { CloudFormationClient } from "@takomo/aws-clients"
import { CommandContext, Stack } from "@takomo/stacks-model"
import { TakomoError } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import uuid from "uuid"
import { DeployStacksIO } from "./model"

const hasStackCreateFailed = (status: CloudFormation.StackStatus): boolean =>
  ["CREATE_FAILED", "ROLLBACK_COMPLETE"].includes(status)

const cleanFailedStack = async (
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
  io.debugObject("Delete failed stack:", {
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

export const cleanFailedStacks = async (
  ctx: CommandContext,
  io: DeployStacksIO,
): Promise<CommandContext> => {
  const failed = new Array<string>()
  const success = new Array<string>()
  io.debug("Delete failed stacks")

  await Promise.all(
    ctx.getStacksToProcess().map(async (stack) => {
      const existing = await ctx.getExistingStack(stack.getPath())
      if (existing && hasStackCreateFailed(existing.StackStatus!)) {
        try {
          io.info(`Delete stack in failed status: ${stack.getPath()}`)
          await cleanFailedStack(io, stack, existing)
          io.info(
            `Stack in failed status deleted successfully: ${stack.getPath()}`,
          )
          success.push(stack.getPath())
          ctx.removeExistingStack(stack.getPath())
          ctx.removeExistingTemplateSummary(stack.getPath())
        } catch (e) {
          io.error(
            `Failed to delete stack in failed status: ${stack.getPath()}`,
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
      `Failed to clean following stacks that were in failed state:\n\n${failedString}`,
    )
  }

  if (success.length > 0) {
    io.debug(`Successfully cleaned ${success.length} failed stacks`)
  } else {
    io.debug("No failed stacks to clean")
  }

  return ctx
}
