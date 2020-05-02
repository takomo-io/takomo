import Joi from "@hapi/joi"
import { commandPath, CommandStatus } from "@takomo/core"
import { validateInput } from "@takomo/util"
import { buildConfigContext, prepareLaunchContext } from "../../../context"
import { listSecrets } from "./list-secrets"
import { ListSecretsInput, ListSecretsIO, ListSecretsOutput } from "./model"

const schema = Joi.object({
  commandPath: commandPath.required(),
}).unknown(true)

export const listSecretsCommand = async (
  input: ListSecretsInput,
  io: ListSecretsIO,
): Promise<ListSecretsOutput> =>
  validateInput(schema, input)
    .then(input => buildConfigContext(input.options, input.variables, io))
    .then(ctx => prepareLaunchContext(ctx, input.commandPath, false))
    .then(listSecrets)
    .then(stacks => ({
      success: true,
      message: "Success",
      stacks,
      status: CommandStatus.SUCCESS,
      watch: input.watch.stop(),
    }))
    .then(io.printOutput)
