import { CloudFormationClient } from "@takomo/aws-clients"
import { StopWatch } from "@takomo/util"
import { CommandContext } from "../../../context"
import { Stack, StackResult } from "../../../model"
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

  logger.debug("Launch stack")
  logger.debugObject("Stack config:", stack)

  const variables = {
    ...ctx.getVariables(),
    hooks: {},
  }

  const initial = {
    ctx,
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
