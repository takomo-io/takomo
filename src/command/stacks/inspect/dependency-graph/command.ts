import Joi, { AnySchema } from "joi"
import { CommandContext } from "../../../../context/command-context.js"
import { createStacksSchemas } from "../../../../schema/stacks-schema.js"
import { CommandHandler } from "../../../../takomo-core/command.js"
import {
  buildStacksContext,
  StacksConfigRepository,
} from "../../../../takomo-stacks-context/index.js"
import { isNotObsolete } from "../../../../takomo-stacks-model/util.js"
import { validateInput } from "../../../../utils/validation.js"
import {
  DependencyGraphInput,
  DependencyGraphIO,
  DependencyGraphOutput,
} from "./model.js"

const inputSchema = (ctx: CommandContext): AnySchema => {
  const { commandPath } = createStacksSchemas({ regions: ctx.regions })
  return Joi.object({
    commandPath: commandPath.required(),
  }).unknown(true)
}

export const dependencyGraphCommand: CommandHandler<
  StacksConfigRepository,
  DependencyGraphIO,
  DependencyGraphInput,
  DependencyGraphOutput
> = ({
  ctx,
  io,
  input,
  configRepository,
  credentialManager,
}): Promise<DependencyGraphOutput> =>
  validateInput(inputSchema(ctx), input)
    .then((input) =>
      buildStacksContext({
        ...input,
        configRepository,
        ctx,
        credentialManager,
        logger: io,
      }),
    )
    .then((ctx) => {
      const { timer } = input
      const output: DependencyGraphOutput = {
        success: true,
        status: "SUCCESS",
        message: "Success",
        timer: timer.stop(),
        stacks: ctx.stacks.filter(isNotObsolete),
        outputFormat: input.outputFormat,
      }

      return output
    })
    .then(io.printOutput)
