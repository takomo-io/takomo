import { CommandContext, CommandHandler } from "@takomo/core"
import {
  buildStacksContext,
  StacksConfigRepository,
} from "@takomo/stacks-context"
import { createStacksSchemas } from "@takomo/stacks-schema"
import { validateInput } from "@takomo/util"
import Joi, { AnySchema } from "joi"
import { listStacks } from "./list-stacks"
import { ListStacksInput, ListStacksIO, ListStacksOutput } from "./model"

const inputSchema = (ctx: CommandContext): AnySchema => {
  const { commandPath } = createStacksSchemas({ regions: ctx.regions })
  return Joi.object({
    commandPath: commandPath.required(),
  }).unknown(true)
}

export const listStacksCommand: CommandHandler<
  StacksConfigRepository,
  ListStacksIO,
  ListStacksInput,
  ListStacksOutput
> = ({
  credentialManager,
  ctx,
  input,
  configRepository,
  io,
}): Promise<ListStacksOutput> =>
  validateInput(inputSchema(ctx), input)
    .then((input) =>
      buildStacksContext({
        ...input,
        configRepository,
        ctx,
        logger: io,
        overrideCredentialManager: credentialManager,
      }),
    )
    .then((ctx) => listStacks(ctx, input))
    .then(io.printOutput)
