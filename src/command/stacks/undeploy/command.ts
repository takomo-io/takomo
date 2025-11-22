import Joi, { AnySchema } from "joi"
import { CommandContext } from "../../../context/command-context.js"
import { InternalStacksContext } from "../../../context/stacks-context.js"
import { createStacksSchemas } from "../../../schema/stacks-schema.js"
import { CommandHandler } from "../../../takomo-core/command.js"
import { buildStacksContext } from "../../../takomo-stacks-context/config/build-stacks-context.js"
import { validateInput } from "../../../utils/validation.js"
import {
  StacksOperationOutput,
  StacksUndeployOperationInput,
} from "../model.js"
import { executeUndeployContext } from "./execute-undeploy-context.js"
import { UndeployStacksIO } from "./model.js"
import { buildStacksUndeployPlan } from "./plan.js"
import { validateStacksUndeployPlan } from "./validate.js"
import { StacksConfigRepository } from "../../../takomo-stacks-context/model.js"

const modifyInput = async (
  input: StacksUndeployOperationInput,
  ctx: InternalStacksContext,
  io: UndeployStacksIO,
): Promise<StacksUndeployOperationInput> => {
  if (input.interactive) {
    const commandPath = await io.chooseCommandPath(ctx.rootStackGroup)
    return {
      ...input,
      commandPath,
    }
  }

  return input
}

const undeployStacks = async (
  ctx: InternalStacksContext,
  io: UndeployStacksIO,
  input: StacksUndeployOperationInput,
): Promise<StacksOperationOutput> => {
  const modifiedInput = await modifyInput(input, ctx, io)

  const plan = await buildStacksUndeployPlan(
    ctx.stacks,
    modifiedInput.commandPath,
    modifiedInput.ignoreDependencies,
    modifiedInput.prune,
  )

  await validateStacksUndeployPlan(plan)
  return executeUndeployContext(ctx, modifiedInput, io, plan)
}

const inputSchema = (ctx: CommandContext): AnySchema => {
  const { commandPath } = createStacksSchemas({ regions: ctx.regions })
  return Joi.object({
    commandPath: commandPath.required(),
    prune: Joi.boolean(),
  }).unknown(true)
}

export const undeployStacksCommand: CommandHandler<
  StacksConfigRepository,
  UndeployStacksIO,
  StacksUndeployOperationInput,
  StacksOperationOutput
> = ({
  credentialManager,
  ctx,
  input,
  configRepository,
  io,
}): Promise<StacksOperationOutput> =>
  validateInput(inputSchema(ctx), input)
    .then(() =>
      buildStacksContext({
        configRepository,
        ctx,
        logger: io,
        credentialManager,
        validateCommandRoles: false,
      }),
    )
    .then((ctx) => undeployStacks(ctx, io, input))
    .then(io.printOutput)
