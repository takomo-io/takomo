import { CloudFormationClient } from "@takomo/aws-clients"
import { resolveStackLaunchType } from "@takomo/stacks-context"
import {
  CommandContext,
  Stack,
  StackLaunchType,
  StackResult,
} from "@takomo/stacks-model"
import { StopWatch } from "@takomo/util"
import { DeployStacksIO } from "./model"
import { waitForDependenciesToComplete } from "./wait"

export const deployStack = async (
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

  logger.info("Preparing stack deployment")
  logger.debugObject("Stack config:", stack)

  const variables = {
    ...ctx.getVariables(),
    hooks: {},
  }

  const existingStack = await ctx.getExistingStack(stack.getPath())
  const existingTemplateSummary = await ctx.getExistingTemplateSummary(
    stack.getPath(),
  )
  const launchType = existingStack
    ? resolveStackLaunchType(existingStack.StackStatus)
    : StackLaunchType.CREATE

  const initial = {
    ctx,
    existingStack,
    existingTemplateSummary,
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
