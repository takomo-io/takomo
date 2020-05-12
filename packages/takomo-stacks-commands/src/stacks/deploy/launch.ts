import { CloudFormationClient } from "@takomo/aws-clients"
import { CommandContext, Stack, StackResult, StackLaunchType, resolveStackLaunchType } from "@takomo/stacks"
import { StopWatch } from "@takomo/util"

import { DeployStacksIO } from "./model"
import { waitForDependenciesToComplete } from "./wait"

export const launchStack = async (
  watch: StopWatch,
  ctx: CommandContext,
  io: DeployStacksIO,
  stack: Stack,
  dependencies: Promise<StackResult>[],
): Promise<StackResult> => {
  const logger = io.childLogger(stack.getPath())

  const cloudFormationClient = new CloudFormationClient({
    logger,
    region: stack.getRegion(),
    credentialProvider: stack.getCredentialProvider(),
  })

  logger.debug("Deploy stack")
  logger.debugObject("Stack config:", stack)

  const variables = {
    ...ctx.getVariables(),
    hooks: {},
  }

  const existingStack = await ctx.getExistingStack(stack.getPath())
  const launchType = existingStack
    ? resolveStackLaunchType(existingStack.StackStatus)
    : StackLaunchType.CREATE

  if (existingStack) {
    logger.info("Update stack")
  } else {
    logger.info("Create stack")
  }

  const initial = {
    ctx,
    existingStack,
    launchType,
    stack,
    dependencies,
    cloudFormationClient,
    io,
    logger,
    variables,
    watch: watch.startChild(stack.getPath()),
  }

  return waitForDependenciesToComplete(initial)
}
