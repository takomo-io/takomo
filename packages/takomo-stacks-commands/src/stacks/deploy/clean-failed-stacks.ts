import { CloudFormationClient } from "@takomo/aws-clients"
import { CommandContext, Stack } from "@takomo/stacks"
import { Logger, TakomoError } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import uuid from "uuid"

const hasStackCreateFailed = (status: CloudFormation.StackStatus): boolean =>
  ["CREATE_FAILED", "ROLLBACK_COMPLETE"].includes(status)

const cleanFailedStack = async (
  logger: Logger,
  stack: Stack,
  existing: CloudFormation.Stack,
): Promise<boolean> => {
  const cf = new CloudFormationClient({
    credentialProvider: stack.getCredentialProvider(),
    region: stack.getRegion(),
    logger,
  })

  const token = uuid.v4()
  logger.debugObject("Clean up failed stack with path:", {
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
        // eslint-disable-next-line
        () => {},
      ),
    )
    .then(() => true)
}

export const cleanFailedStacks = async (
  ctx: CommandContext,
): Promise<CommandContext> => {
  const failed = new Array<string>()
  const success = new Array<string>()
  const logger = ctx.getLogger()
  logger.debug("Clean up failed stacks")

  await Promise.all(
    ctx.getStacksToProcess().map(async (stack) => {
      const existing = await ctx.getExistingStack(stack.getPath())
      if (existing && hasStackCreateFailed(existing.StackStatus!)) {
        try {
          await cleanFailedStack(logger, stack, existing)
          success.push(stack.getPath())
        } catch (e) {
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
    logger.debug(`Successfuly cleaned ${success.length} failed stacks`)
  } else {
    logger.debug("No failed stacks to clean")
  }

  return ctx
}
