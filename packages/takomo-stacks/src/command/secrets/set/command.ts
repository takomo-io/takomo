import Joi from "@hapi/joi"
import { stackPath } from "@takomo/core"
import { validateInput } from "@takomo/util"
import { buildConfigContext, prepareLaunchContext } from "../../../context"
import { secretName } from "../../../schema"
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
    .then((ctx) => prepareLaunchContext(ctx, input.stackPath, false))
    .then((ctx) => setSecretValue(ctx, input, io))
    .then(io.printOutput)
