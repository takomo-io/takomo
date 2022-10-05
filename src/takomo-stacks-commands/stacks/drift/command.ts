import Joi, { AnySchema } from "joi"
import { CommandContext, CommandHandler } from "../../../takomo-core"
import {
  buildStacksContext,
  StacksConfigRepository,
} from "../../../takomo-stacks-context"
import { createStacksSchemas } from "../../../takomo-stacks-schema"
import { validateInput } from "../../../takomo-util"
import { detectDrift } from "./detect-drift"
import { DetectDriftInput, DetectDriftIO, DetectDriftOutput } from "./model"

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
