import { CommandContext, CommandHandler } from "@takomo/core"
import {
  buildStacksContext,
  StacksConfigRepository,
} from "@takomo/stacks-context"
import { InternalStacksContext } from "@takomo/stacks-model"
import { createStacksSchemas } from "@takomo/stacks-schema"
import { validateInput } from "@takomo/util"
import Joi, { AnySchema } from "joi"
import {
  StacksOperationOutput,
  StacksUndeployOperationInput,
} from "../../model"
import { executeUndeployContext } from "./execute-undeploy-context"
import { UndeployStacksIO } from "./model"
import { buildStacksUndeployPlan } from "./plan"
import { validateStacksUndeployPlan } from "./validate"

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
  configRepository: StacksConfigRepository,
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
      }),
    )
    .then((ctx) => undeployStacks(ctx, configRepository, io, input))
    .then(io.printOutput)
