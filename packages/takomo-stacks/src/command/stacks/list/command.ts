import Joi from "@hapi/joi"
import { commandPath } from "@takomo/core"
import { validateInput } from "@takomo/util"
import { buildConfigContext } from "../../../context/config"
import { prepareLaunchContext } from "../../../context/launch"
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
    .then(input => buildConfigContext(input.options, input.variables, io))
    .then(ctx => prepareLaunchContext(ctx, input.commandPath, false))
    .then(ctx => listStacks(ctx, input))
    .then(io.printOutput)
