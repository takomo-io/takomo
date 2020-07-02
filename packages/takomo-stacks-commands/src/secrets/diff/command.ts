import Joi from "@hapi/joi"
import { commandPath, CommandStatus } from "@takomo/core"
import {
  buildConfigContext,
  prepareDeployContext,
} from "@takomo/stacks-context"
import { validateInput } from "@takomo/util"
import { diffSecrets } from "./diff-secrets"
import { DiffSecretsInput, DiffSecretsIO, DiffSecretsOutput } from "./model"

const schema = Joi.object({
  commandPath: commandPath.required(),
}).unknown(true)

export const diffSecretsCommand = async (
  input: DiffSecretsInput,
  io: DiffSecretsIO,
): Promise<DiffSecretsOutput> =>
  validateInput(schema, input)
    .then((input) => buildConfigContext(input.options, input.variables, io))
    .then((ctx) => prepareDeployContext(ctx, input.commandPath, false))
    .then(diffSecrets)
    .then((stacks) => ({
      success: true,
      message: "Success",
      stacks,
      status: CommandStatus.SUCCESS,
      watch: input.watch.stop(),
    }))
    .then(io.printOutput)
