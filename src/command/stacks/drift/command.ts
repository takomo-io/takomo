import Joi, { AnySchema } from "joi"
import { CommandContext } from "../../../context/command-context"
import { createStacksSchemas } from "../../../schema/stacks-schema"
import { CommandHandler } from "../../../takomo-core/command"
import {
  buildStacksContext,
  StacksConfigRepository,
} from "../../../takomo-stacks-context"
import { validateInput } from "../../../utils/validation"
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
