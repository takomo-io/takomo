import Joi, { AnySchema } from "joi"
import { createAwsSchemas } from "../schema/aws-schema"
import {
  CommandContext,
  CommandHandler,
  createCommonSchema,
} from "../takomo-core"
import { validateInput } from "../utils/validation"
import {
  InitProjectInput,
  InitProjectIO,
  InitProjectOutput,
  ProjectConfigRepository,
} from "./model"

const initProject = async (
  ctx: CommandContext,
  io: InitProjectIO,
  input: InitProjectInput,
  configRepository: ProjectConfigRepository,
): Promise<InitProjectOutput> => {
  const { timer } = input
  const info = await io.promptProjectInformation(ctx, input)
  const description = await configRepository.putProjectConfig(info)

  return {
    description,
    message: "Success",
    status: "SUCCESS",
    success: true,
    outputFormat: input.outputFormat,
    timer: timer.stop(),
  }
}

const inputSchema = (ctx: CommandContext): AnySchema => {
  const { region } = createAwsSchemas({ regions: ctx.regions })
  const { project } = createCommonSchema()

  return Joi.object({
    project,
    regions: Joi.array().items(region).unique(),
    createSamples: Joi.boolean(),
  }).unknown(true)
}

export const initProjectCommand: CommandHandler<
  ProjectConfigRepository,
  InitProjectIO,
  InitProjectInput,
  InitProjectOutput
> = async ({ ctx, io, input, configRepository }): Promise<InitProjectOutput> =>
  validateInput(inputSchema(ctx), input)
    .then((input) => initProject(ctx, io, input, configRepository))
    .then(io.printOutput)
