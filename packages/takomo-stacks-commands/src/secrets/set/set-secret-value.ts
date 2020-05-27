import { SSMClient } from "@takomo/aws-clients"
import { CommandStatus } from "@takomo/core"
import { CommandContext } from "@takomo/stacks-model"
import { TakomoError } from "@takomo/util"
import { SetSecretInput, SetSecretIO, SetSecretOutput } from "./model"

export const setSecretValue = async (
  ctx: CommandContext,
  input: SetSecretInput,
  io: SetSecretIO,
): Promise<SetSecretOutput> => {
  const watch = input.watch
  const [stack, ...rest] = ctx.getStacksByPath(input.stackPath)
  if (!stack) {
    throw new TakomoError(`Stack not found with stack path: ${input.stackPath}`)
  }
  if (rest.length > 0) {
    throw new TakomoError(
      `More than one stack found with stack path: ${input.stackPath}`,
    )
  }

  const { secretName } = input

  const secret = stack.getSecrets().get(secretName)
  if (!secret) {
    throw new TakomoError(
      `Stack ${stack.getPath()} does not contain secret: ${secretName}`,
    )
  }

  const value = await io.promptSecretValue(secret)

  const ssm = new SSMClient({
    credentialProvider: stack.getCredentialProvider(),
    region: stack.getRegion(),
    logger: ctx.getLogger(),
  })

  await ssm.putEncryptedParameter(
    secret.ssmParameterName,
    value,
    secret.description,
  )

  return {
    success: true,
    message: "Success",
    status: CommandStatus.SUCCESS,
    watch: watch.stop(),
  }
}
