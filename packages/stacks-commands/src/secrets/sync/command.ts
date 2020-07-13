import Joi from "@hapi/joi"
import { commandPath } from "@takomo/core"
import {
  buildConfigContext,
  prepareDeployContext,
} from "@takomo/stacks-context"
import { validateInput } from "@takomo/util"
import { SyncSecretsInput, SyncSecretsIO, SyncSecretsOutput } from "./model"
import { syncSecrets } from "./sync-secrets"

const schema = Joi.object({
  commandPath: commandPath.required(),
}).unknown(true)

export const syncSecretsCommand = async (
  input: SyncSecretsInput,
  io: SyncSecretsIO,
): Promise<SyncSecretsOutput> =>
  validateInput(schema, input)
    .then((input) => buildConfigContext(input.options, input.variables, io))
    .then((ctx) => prepareDeployContext(ctx, input.commandPath, false))
    .then((ctx) => syncSecrets(ctx, input, io))
    .then(io.printOutput)
