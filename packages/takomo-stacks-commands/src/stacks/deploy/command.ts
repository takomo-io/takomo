import Joi from "@hapi/joi"
import { commandPath, TakomoCredentialProvider } from "@takomo/core"
import {
  buildConfigContext,
  ConfigContext,
  prepareDeployContext,
} from "@takomo/stacks-context"
import { validateInput } from "@takomo/util"
import { StacksOperationInput, StacksOperationOutput } from "../../model"
import { executeDeployContext } from "./execute-deploy-context"
import { DeployStacksIO } from "./model"
import { validateDeployContext } from "./validate"

const schema = Joi.object({
  commandPath: commandPath.required(),
}).unknown(true)

const modifyInput = async (
  input: StacksOperationInput,
  ctx: ConfigContext,
  io: DeployStacksIO,
): Promise<StacksOperationInput> => {
  if (input.interactive) {
    const commandPath = await io.chooseCommandPath(ctx.getRootStackGroup())
    return {
      ...input,
      commandPath,
    }
  }

  return input
}

export const deployStacksCommand = async (
  input: StacksOperationInput,
  io: DeployStacksIO,
  credentialProvider: TakomoCredentialProvider | null = null,
): Promise<StacksOperationOutput> =>
  validateInput(schema, input)
    .then((input) =>
      buildConfigContext(
        input.options,
        input.variables,
        io,
        credentialProvider,
      ),
    )
    .then(async (ctx) => {
      const modifiedInput = await modifyInput(input, ctx, io)
      return prepareDeployContext(
        ctx,
        modifiedInput.commandPath,
        modifiedInput.ignoreDependencies,
      )
        .then((ctx) => validateDeployContext(ctx))
        .then((ctx) => executeDeployContext(ctx, modifiedInput, io))
    })
    .then(io.printOutput)
