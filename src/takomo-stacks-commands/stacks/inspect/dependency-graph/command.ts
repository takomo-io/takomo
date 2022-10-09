import Joi, { AnySchema } from "joi"
import { CommandContext, CommandHandler } from "../../../../takomo-core"
import {
  buildStacksContext,
  StacksConfigRepository,
} from "../../../../takomo-stacks-context"
import { isNotObsolete } from "../../../../takomo-stacks-model"
import { createStacksSchemas } from "../../../../takomo-stacks-schema"
import { validateInput } from "../../../../takomo-util"
import {
  DependencyGraphInput,
  DependencyGraphIO,
  DependencyGraphOutput,
} from "./model"

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
      timer.stop()
      const output: DependencyGraphOutput = {
        success: true,
        status: "SUCCESS",
        message: "Success",
        timer,
        stacks: ctx.stacks.filter(isNotObsolete),
        outputFormat: input.outputFormat,
      }

      return output
    })
    .then(io.printOutput)
