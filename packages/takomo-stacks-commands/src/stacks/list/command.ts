import Joi from "@hapi/joi"
import { commandPath } from "@takomo/core"
import {
  buildConfigContext,
  prepareDeployContext,
} from "@takomo/stacks-context"
import { validateInput } from "@takomo/util"
import { listStacks } from "./list-stacks"
import { ListStacksInput, ListStacksIO, ListStacksOutput } from "./model"

const schema = Joi.object({
  commandPath: commandPath.required(),
}).unknown(true)

export const listStacksCommand = async (
  input: ListStacksInput,
  io: ListStacksIO,
): Promise<ListStacksOutput> =>
  validateInput(schema, input)
    .then((input) => buildConfigContext(input.options, input.variables, io))
    .then((ctx) => prepareDeployContext(ctx, input.commandPath, false))
    .then((ctx) => listStacks(ctx, input))
    .then(io.printOutput)
