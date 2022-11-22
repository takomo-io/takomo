import Joi, { AnySchema } from "joi"
import { createStacksSchemas } from "../../../schema/stacks-schema"
import { CommandContext, CommandHandler } from "../../../takomo-core"
import {
  buildStacksContext,
  StacksConfigRepository,
} from "../../../takomo-stacks-context"
import { validateInput } from "../../../utils/validation"
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
  ctx,
  input,
  configRepository,
  io,
  credentialManager,
}): Promise<ListStacksOutput> =>
  validateInput(inputSchema(ctx), input)
    .then((input) =>
      buildStacksContext({
        ...input,
        configRepository,
        ctx,
        logger: io,
        credentialManager,
      }),
    )
    .then((ctx) => listStacks(ctx, input, io))
    .then(io.printOutput)
