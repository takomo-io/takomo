import { CommandContext, CommandHandler } from "@takomo/core"
import {
  buildStacksContext,
  StacksConfigRepository,
} from "@takomo/stacks-context"
import { InternalStacksContext } from "@takomo/stacks-model"
import { createStacksSchemas } from "@takomo/stacks-schema"
import { validateInput } from "@takomo/util"
import Joi, { AnySchema } from "joi"
import { StacksOperationInput, StacksOperationOutput } from "../../model"
import { executeDeployContext } from "./execute-deploy-context"
import { DeployStacksIO } from "./model"
import { buildStacksDeployPlan } from "./plan"
import { validateStacksDeployPlan } from "./validate"

const modifyInput = async (
  input: StacksOperationInput,
  ctx: InternalStacksContext,
  io: DeployStacksIO,
): Promise<StacksOperationInput> => {
  if (input.interactive) {
    const commandPath = await io.chooseCommandPath(ctx.rootStackGroup)
    return {
      ...input,
      commandPath,
    }
  }

  return input
}

const deployStacks = async (
  ctx: InternalStacksContext,
  configRepository: StacksConfigRepository,
  io: DeployStacksIO,
  input: StacksOperationInput,
): Promise<StacksOperationOutput> => {
  const modifiedInput = await modifyInput(input, ctx, io)

  const plan = await buildStacksDeployPlan(
    ctx.stacks,
    modifiedInput.commandPath,
    modifiedInput.ignoreDependencies,
    io,
  )

  await validateStacksDeployPlan(plan)

  return executeDeployContext(ctx, modifiedInput, io, plan, configRepository)
}

const inputSchema = (ctx: CommandContext): AnySchema => {
  const { commandPath } = createStacksSchemas({ regions: ctx.regions })
  return Joi.object({
    commandPath: commandPath.required(),
  }).unknown(true)
}

export const deployStacksCommand: CommandHandler<
  StacksConfigRepository,
  DeployStacksIO,
  StacksOperationInput,
  StacksOperationOutput
> = ({
  credentialManager,
  ctx,
  input,
  configRepository,
  io,
}): Promise<StacksOperationOutput> =>
  validateInput(inputSchema(ctx), input)
    .then((input) =>
      buildStacksContext({
        ctx,
        configRepository,
        commandPath: input.interactive ? undefined : input.commandPath,
        logger: io,
        credentialManager,
      }),
    )
    .then((ctx) => deployStacks(ctx, configRepository, io, input))
    .then(io.printOutput)
