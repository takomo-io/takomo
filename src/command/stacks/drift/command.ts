import Joi, { AnySchema } from "joi"
import { CommandContext } from "../../../context/command-context.js"
import { createStacksSchemas } from "../../../schema/stacks-schema.js"
import { CommandHandler } from "../../../takomo-core/command.js"
import { buildStacksContext } from "../../../takomo-stacks-context/config/build-stacks-context.js"
import { validateInput } from "../../../utils/validation.js"
import { detectDrift } from "./detect-drift.js"
import { DetectDriftInput, DetectDriftIO, DetectDriftOutput } from "./model.js"
import { StacksConfigRepository } from "../../../takomo-stacks-context/model.js"

const inputSchema = (ctx: CommandContext): AnySchema => {
  const { commandPath } = createStacksSchemas({ regions: ctx.regions })
  return Joi.object({
    commandPath: commandPath.required(),
  }).unknown(true)
}

export const detectDriftCommand: CommandHandler<
  StacksConfigRepository,
  DetectDriftIO,
  DetectDriftInput,
  DetectDriftOutput
> = ({
  ctx,
  input,
  configRepository,
  io,
  credentialManager,
}): Promise<DetectDriftOutput> =>
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
    .then((ctx) => detectDrift(ctx, input, io))
    .then(io.printOutput)
