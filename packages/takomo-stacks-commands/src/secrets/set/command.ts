import Joi from "@hapi/joi"
import { stackPath } from "@takomo/core"
import {
  buildConfigContext,
  prepareDeployContext,
} from "@takomo/stacks-context"
import { secretName } from "@takomo/stacks-schema"
import { validateInput } from "@takomo/util"
import { SetSecretInput, SetSecretIO, SetSecretOutput } from "./model"
import { setSecretValue } from "./set-secret-value"

const schema = Joi.object({
  stackPath: stackPath.required(),
  secretName: secretName.required(),
}).unknown(true)

export const setSecretCommand = async (
  input: SetSecretInput,
  io: SetSecretIO,
): Promise<SetSecretOutput> =>
  validateInput(schema, input)
    .then((input) => buildConfigContext(input.options, input.variables, io))
    .then((ctx) => prepareDeployContext(ctx, input.stackPath, false))
    .then((ctx) => setSecretValue(ctx, input, io))
    .then(io.printOutput)
