import { CloudFormationClient } from "@takomo/aws-clients"
import { CommandStatus } from "@takomo/core"
import {
  defaultCapabilities,
  Stack,
  StackLaunchType,
  StackResult,
} from "@takomo/stacks-model"
import { CloudFormation } from "aws-sdk"
import {
  ChangeSetType,
  DescribeChangeSetOutput,
} from "aws-sdk/clients/cloudformation"
import uuid from "uuid"
import { createOrUpdateStack } from "./execute"
import { ConfirmStackDeployAnswer, DeployStacksIO, TagsHolder } from "./model"

export const resolveChangeSetType = (
  launchType: StackLaunchType,
): ChangeSetType => {
  switch (launchType) {
    case StackLaunchType.UPDATE:
      return "UPDATE"
    case StackLaunchType.CREATE:
    case StackLaunchType.RECREATE:
      return "CREATE"
    default:
      throw new Error(`Unsupported stack launch type: ${launchType}`)
  }
}

const confirmStackDeploy = async (
  autoConfirm: boolean,
  io: DeployStacksIO,
  stack: Stack,
  changeSet: DescribeChangeSetOutput | null,
  templateBody: string,
  templateSummary: CloudFormation.GetTemplateSummaryOutput,
  cloudFormationClient: CloudFormationClient,
  existingStack: CloudFormation.Stack | null,
  existingTemplateSummary: CloudFormation.GetTemplateSummaryOutput | null,
): Promise<ConfirmStackDeployAnswer> => {
  if (autoConfirm) {
    return ConfirmStackDeployAnswer.CONTINUE_AND_SKIP_REMAINING_REVIEWS
  }

  return io.confirmStackDeploy(
    stack,
    changeSet,
    templateBody,
    templateSummary,
    cloudFormationClient,
    existingStack,
    existingTemplateSummary,
  )
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
    templateSummary,
    parameters,
    tags,
    cloudFormationClient,
    io,
    watch,
    logger,
    existingStack,
    existingTemplateSummary,
    state,
  } = holder

  const childWatch = watch.startChild("review-changes")
  const clientToken = uuid.v4()
  const changeSetName = `change-${clientToken}`
  const changeSetType = resolveChangeSetType(launchType)
  const templateLocation = templateS3Url || templateBody
  const templateKey = templateS3Url ? "TemplateURL" : "TemplateBody"

  logger.info("Create change set")
  logger.debugObject("Change set data:", {
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

    const terminationProtectionChanged = existingStack
      ? existingStack.EnableTerminationProtection !==
        stack.isTerminationProtectionEnabled()
      : false

    if (!changeSet && !terminationProtectionChanged) {
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

    const autoConfirm = ctx.getOptions().isAutoConfirmEnabled()
    const answer = await confirmStackDeploy(
      autoConfirm,
      io,
      stack,
      changeSet,
      templateBody,
      templateSummary,
      cloudFormationClient,
      existingStack,
      existingTemplateSummary,
    )

    if (answer === ConfirmStackDeployAnswer.CANCEL) {
      if (changeSet && changeSetType === "CREATE") {
        logger.info("Clean up temporary stack")
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
        message: "Deploy cancelled",
        reason: "CANCELLED",
        status: CommandStatus.CANCELLED,
        events: [],
        success: false,
        watch: watch.stop(),
      }
    }

    if (
      answer === ConfirmStackDeployAnswer.CONTINUE_AND_SKIP_REMAINING_REVIEWS
    ) {
      state.autoConfirm = true
    }

    if (changeSet && changeSetType === "CREATE") {
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
