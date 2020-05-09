import { CommandStatus } from "@takomo/core"
import { StackResult } from "@takomo/stacks"
import { CloudFormation } from "aws-sdk"
import { initiateFailedCloudFormationStackDeletion } from "./delete"
import { executeBeforeLaunchHooks } from "./hooks"
import { TargetStackInfoHolder, TemplateLocationHolder } from "./model"
import { prepareParameters } from "./parameters"

export const hasPreviousStackCreateFailed = (
  stackStatus: CloudFormation.StackStatus,
): boolean => ["CREATE_FAILED", "ROLLBACK_COMPLETE"].includes(stackStatus)

export const isStackReadyForLaunch = (
  stackStatus: CloudFormation.StackStatus,
): boolean =>
  [
    "CREATE_COMPLETE",
    "UPDATE_COMPLETE",
    "UPDATE_ROLLBACK_COMPLETE",
    "REVIEW_IN_PROGRESS",
  ].includes(stackStatus)

export const validateCloudFormationStackStatus = async (
  holder: TargetStackInfoHolder,
): Promise<StackResult> => {
  const { stack, current, watch, logger } = holder

  logger.debug("Validate stack status")

  if (isStackReadyForLaunch(current.status)) {
    logger.debug(`Stack status ${current.status} is valid`)
    return await executeBeforeLaunchHooks(holder)
  }

  if (hasPreviousStackCreateFailed(current.status)) {
    logger.debug("Previous stack create has failed")
    return await initiateFailedCloudFormationStackDeletion(holder)
  }

  logger.warn(`Stack status ${current.status} is not valid`)

  return {
    stack,
    message: `Stack status '${current.status}' does not allow launch`,
    reason: "CHECK_STACK_STATUS_FAILED",
    status: CommandStatus.FAILED,
    events: [],
    success: false,
    watch: watch.stop(),
  }
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
    return prepareParameters(holder)
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
