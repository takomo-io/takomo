import { CloudFormationClient, SSMClient } from "@takomo/aws-clients"
import { CommandStatus } from "@takomo/core"
import { CommandContext, Stack, StackResult } from "@takomo/stacks"
import { StopWatch } from "@takomo/util"
import uuid from "uuid"
import { InitialDeleteContext, UndeployStacksIO } from "./model"
import {
  waitCloudFormationStackDeletionToComplete,
  waitForDependantsToComplete,
} from "./wait"

export const deleteStack = async (
  watch: StopWatch,
  ctx: CommandContext,
  io: UndeployStacksIO,
  stack: Stack,
  dependants: Promise<StackResult>[],
): Promise<StackResult> => {
  const logger = io.childLogger(stack.getPath())
  logger.debugObject("Stack config:", stack)

  const existingStack = await ctx.getExistingStack(stack.getPath())
  if (!existingStack) {
    logger.debug("No existing stack found")
    return {
      stack,
      message: "Stack not found",
      reason: "DELETE_SKIPPED",
      status: CommandStatus.SKIPPED,
      events: [],
      success: true,
      watch: watch.stop(),
    }
  }

  const cloudFormationClient = new CloudFormationClient({
    region: stack.getRegion(),
    credentialProvider: stack.getCredentialProvider(),
    logger,
  })

  const variables = {
    ...ctx.getVariables(),
    hooks: {},
  }

  const initial = {
    ctx,
    existingStack,
    stack,
    dependants,
    cloudFormationClient,
    io,
    logger,
    variables,
    watch: watch.startChild(stack.getPath()),
  }

  return waitForDependantsToComplete(initial)
}

export const initiateCloudFormationStackDeletion = async (
  holder: InitialDeleteContext,
): Promise<StackResult> => {
  const { stack, existingStack, cloudFormationClient, watch, logger } = holder
  const childWatch = watch.startChild("initiate-stack-deletion")

  const clientToken = uuid.v4()

  try {
    logger.debug(`Initiate stack deletion with client token ${clientToken}`)
    await cloudFormationClient.initiateStackDeletion({
      StackName: existingStack!.StackId!,
      ClientRequestToken: clientToken,
    })
  } catch (e) {
    logger.error("An error occurred while initiating stack deletion", e)
    return {
      stack,
      message: "Initiate stack deletion failed",
      reason: "INITIATE_DELETE_STACK_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }

  logger.debug("Stack delete initiated successfully")
  childWatch.stop()
  return await waitCloudFormationStackDeletionToComplete({
    ...holder,
    clientToken,
  })
}

export const deleteSecrets = async (
  initial: InitialDeleteContext,
): Promise<StackResult> => {
  const { stack, watch, logger } = initial
  const childWatch = watch.startChild("delete-secrets")

  logger.debug("Delete secrets")

  try {
    const ssm = new SSMClient({
      credentialProvider: stack.getCredentialProvider(),
      region: stack.getRegion(),
      logger,
    })

    const parameters = await ssm.getEncryptedParametersByPath(
      stack.getSecretsPath(),
    )

    logger.debug(`Found ${parameters.length} secret(s)`)

    if (parameters.length > 0) {
      const parameterNames = parameters.map((p) => p.Name!)
      logger.debugObject(
        "Delete following SSM parameter(s) used to store secrets:",
        parameterNames,
      )
      await ssm.deleteParameters(parameterNames)
      logger.debug("SSM parameter(s) deleted")
    }
  } catch (e) {
    logger.error("An error occurred while deleting secrets", e)
    return {
      stack,
      message: e.message,
      reason: "DELETE_SECRETS_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }

  childWatch.stop()
  return initiateCloudFormationStackDeletion(initial)
}
