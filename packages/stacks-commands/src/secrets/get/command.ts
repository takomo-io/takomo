import Joi from "@hapi/joi"
import { CommandStatus, stackPath } from "@takomo/core"
import {
  buildConfigContext,
  prepareDeployContext,
} from "@takomo/stacks-context"
import { secretName } from "@takomo/stacks-schema"
import { StopWatch, validateInput } from "@takomo/util"
import { getSecretValue } from "./get-secret-value"
import { GetSecretInput, GetSecretIO, GetSecretOutput } from "./model"

const schema = Joi.object({
  stackPath: stackPath.required(),
  secretName: secretName.required(),
}).unknown(true)

export const getSecretCommand = async (
  input: GetSecretInput,
  io: GetSecretIO,
): Promise<GetSecretOutput> =>
  validateInput(schema, input)
    .then((input) => buildConfigContext(input.options, input.variables, io))
    .then((ctx) => prepareDeployContext(ctx, input.stackPath, false))
    .then((ctx) => getSecretValue(ctx, input.stackPath, input.secretName))
    .then((value) => ({
      success: true,
      message: "Success",
      value,
      status: CommandStatus.SUCCESS,
      watch: new StopWatch("total").stop(),
    }))
    .then(io.printOutput)
