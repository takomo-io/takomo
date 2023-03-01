import Joi, { AnySchema } from "joi"
import { CommandContext } from "../../../context/command-context.js"
import { InternalStacksContext } from "../../../context/stacks-context.js"
import { createStacksSchemas } from "../../../schema/stacks-schema.js"
import { CommandHandler } from "../../../takomo-core/command.js"
import {
  buildStacksContext,
  StacksConfigRepository,
} from "../../../takomo-stacks-context/index.js"
import { validateInput } from "../../../utils/validation.js"
import { StacksDeployOperationInput, StacksOperationOutput } from "../model.js"
import { executeDeployContext } from "./execute-deploy-context.js"
import { DeployStacksIO } from "./model.js"
import { buildStacksDeployPlan } from "./plan.js"
import { validateStacksDeployPlan } from "./validate.js"

const modifyInput = async (
  input: StacksDeployOperationInput,
  ctx: InternalStacksContext,
  io: DeployStacksIO,
): Promise<StacksDeployOperationInput> => {
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
  input: StacksDeployOperationInput,
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
  StacksDeployOperationInput,
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
        validateCommandRoles: false,
      }),
    )
    .then((ctx) => deployStacks(ctx, configRepository, io, input))
    .then(io.printOutput)
