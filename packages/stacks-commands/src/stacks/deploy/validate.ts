import { CommandStatus } from "@takomo/core"
import { CommandContext, StackResult } from "@takomo/stacks-model"
import { TakomoError } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import { TemplateLocationHolder } from "./model"
import { summarizeTemplate } from "./template"

export const isStackReadyForLaunch = (
  stackStatus: CloudFormation.StackStatus,
): boolean =>
  [
    "CREATE_COMPLETE",
    "UPDATE_COMPLETE",
    "UPDATE_ROLLBACK_COMPLETE",
    "REVIEW_IN_PROGRESS",
    "CREATE_FAILED",
    "ROLLBACK_COMPLETE",
  ].includes(stackStatus)

export const validateDeployContext = async (
  ctx: CommandContext,
): Promise<CommandContext> => {
  const stacksInInvalidStatus = []
  for (const stack of ctx.getStacksToProcess()) {
    const existing = await ctx.getExistingStack(stack.getPath())
    if (existing && !isStackReadyForLaunch(existing.StackStatus!)) {
      stacksInInvalidStatus.push({ stack, existing })
    }
  }

  if (stacksInInvalidStatus.length > 0) {
    throw new TakomoError(
      "Can't deploy stacks because following stacks are in invalid status:\n\n" +
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

export const validateTemplate = async (
  holder: TemplateLocationHolder,
): Promise<StackResult> => {
  const {
    stack,
    templateS3Url,
    templateBody,
    cloudFormationClient,
    io,
    watch,
  } = holder

  const childWatch = watch.startChild("validate-template")
  io.debug(`${stack.getPath()} - Validate template`)

  const input = templateS3Url || templateBody
  const key = templateS3Url ? "TemplateURL" : "TemplateBody"

  try {
    await cloudFormationClient.validateTemplate({
      [key]: input,
    })

    childWatch.stop()
    return summarizeTemplate(holder)
  } catch (e) {
    io.error(`${stack.getPath()} - Failed to validate template`, e)
    return {
      stack,
      message: e.message,
      reason: "TEMPLATE_VALIDATION_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }
}
