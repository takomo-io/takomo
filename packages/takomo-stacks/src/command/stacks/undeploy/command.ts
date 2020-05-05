import Joi from "@hapi/joi"
import { commandPath, TakomoCredentialProvider } from "@takomo/core"
import { validateInput } from "@takomo/util"
import {
  buildConfigContext,
  ConfigContext,
  prepareDeleteContext,
} from "../../../context"
import { StacksOperationInput, StacksOperationOutput } from "../../../model"
import { executeDeleteContext } from "./execute-delete-context"
import { UndeployStacksIO } from "./model"

const schema = Joi.object({
  commandPath: commandPath.required(),
}).unknown(true)

const modifyInput = async (
  input: StacksOperationInput,
  ctx: ConfigContext,
  io: UndeployStacksIO,
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

export const undeployStacksCommand = async (
  input: StacksOperationInput,
  io: UndeployStacksIO,
  credentialProvider: TakomoCredentialProvider | null = null,
): Promise<StacksOperationOutput> => {
  return validateInput(schema, input)
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
      return prepareDeleteContext(
        ctx,
        modifiedInput.commandPath,
        modifiedInput.ignoreDependencies,
      ).then((ctx) => executeDeleteContext(ctx, modifiedInput, io))
    })
    .then(io.printOutput)
}
