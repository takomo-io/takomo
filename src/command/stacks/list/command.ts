import Joi, { AnySchema } from "joi"
import { CommandContext } from "../../../context/command-context.js"
import { createStacksSchemas } from "../../../schema/stacks-schema.js"
import { CommandHandler } from "../../../takomo-core/command.js"
import {
  buildStacksContext,
  StacksConfigRepository,
} from "../../../takomo-stacks-context/index.js"
import { validateInput } from "../../../utils/validation.js"
import { listStacks } from "./list-stacks.js"
import { ListStacksInput, ListStacksIO, ListStacksOutput } from "./model.js"

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
