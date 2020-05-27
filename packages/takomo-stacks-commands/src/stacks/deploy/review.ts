import { CommandStatus, ConfirmResult } from "@takomo/core"
import {
  defaultCapabilities,
  StackLaunchType,
  StackResult,
} from "@takomo/stacks-model"
import { ChangeSetType } from "aws-sdk/clients/cloudformation"
import uuid from "uuid"
import { createOrUpdateStack } from "./execute"
import { TagsHolder } from "./model"

export const resolveChangeSetType = (
  launchType: StackLaunchType,
): ChangeSetType => {
  switch (launchType) {
    case StackLaunchType.UPDATE:
      return "UPDATE"
    case StackLaunchType.CREATE:
      return "CREATE"
    default:
      throw new Error(`Unsupported stack launch type: ${launchType}`)
  }
}

export const reviewChanges = async (
  holder: TagsHolder,
): Promise<StackResult> => {
  const {
    ctx,
    stack,
    launchType,
    templateS3Url,
    templateBody,
    parameters,
    tags,
    cloudFormationClient,
    io,
    watch,
    logger,
  } = holder

  const childWatch = watch.startChild("review-changes")
  const clientToken = uuid.v4()
  const changeSetName = `change-${clientToken}`
  const changeSetType = resolveChangeSetType(launchType)
  const templateLocation = templateS3Url || templateBody
  const templateKey = templateS3Url ? "TemplateURL" : "TemplateBody"

  logger.debugObject("Create change set:", {
    clientToken,
    name: changeSetName,
    type: changeSetType,
  })

  try {
    const changeSetId = await cloudFormationClient.createChangeSet({
      StackName: stack.getName(),
      ChangeSetType: changeSetType,
      [templateKey]: templateLocation,
      ChangeSetName: changeSetName,
      Capabilities: stack.getCapabilities() || defaultCapabilities,
      Parameters: parameters,
      Tags: tags,
    })

    logger.debug(`Change set created successfully with id ${changeSetId}`)

    const changeSet = await cloudFormationClient.waitUntilChangeSetIsReady(
      stack.getName(),
      changeSetName,
    )

    if (!changeSet) {
      logger.debug("Change set contains no changes")
      return {
        stack,
        message: "No changes",
        reason: "SKIPPED",
        status: CommandStatus.SKIPPED,
        events: [],
        success: true,
        watch: watch.stop(),
      }
    }

    logger.debug("Change set contains changes")

    if (
      !ctx.getOptions().isAutoConfirmEnabled() &&
      (await io.confirmStackLaunch(
        stack,
        changeSet,
        templateBody,
        cloudFormationClient,
      )) !== ConfirmResult.YES
    ) {
      if (changeSetType === "CREATE") {
        logger.debug("Initiate deletion of the created temporary stack")
        await cloudFormationClient.initiateStackDeletion({
          StackName: stack.getName(),
        })
        await cloudFormationClient.waitUntilStackIsDeleted(
          stack.getName(),
          changeSet.StackId!,
          uuid.v4(),
        )
        logger.debug("Temporary stack deleted successfully")
      } else {
        logger.debug("Delete change set")
        await cloudFormationClient.deleteChangeSet(
          stack.getName(),
          changeSetName,
        )
      }

      return {
        stack,
        message: "Launch cancelled",
        reason: "CANCELLED",
        status: CommandStatus.CANCELLED,
        events: [],
        success: false,
        watch: watch.stop(),
      }
    }

    if (changeSetType === "CREATE") {
      logger.debug("Initiate deletion of the created temporary stack")
      await cloudFormationClient.initiateStackDeletion({
        StackName: stack.getName(),
      })
      await cloudFormationClient.waitUntilStackIsDeleted(
        stack.getName(),
        changeSet.StackId!,
        uuid.v4(),
      )
      logger.debug("Temporary stack deleted successfully")
    } else {
      logger.debug("Delete change set")
      await cloudFormationClient.deleteChangeSet(stack.getName(), changeSetName)
    }

    childWatch.stop()

    return createOrUpdateStack(holder)
  } catch (e) {
    logger.error("Failed to create change set", e)
    return {
      stack,
      message: "Create change set failed",
      reason: "CREATE_CHANGE_SET_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }
}
