import { SSMClient } from "@takomo/aws-clients"
import { CommandPath } from "@takomo/core"
import { TakomoError } from "@takomo/util"
import { CommandContext } from "../../../context"

export const getSecretValue = async (
  ctx: CommandContext,
  commandPath: CommandPath,
  secretName: string,
): Promise<string | null> => {
  const [stack, ...rest] = ctx.getStacksByPath(commandPath)

  if (!stack) {
    throw new TakomoError(`Stack not found with command path: ${commandPath}`)
  }

  if (rest.length > 0) {
    throw new TakomoError(
      `More than one stack found with command path: ${commandPath}`,
    )
  }

  const secret = stack.getSecrets().get(secretName)

  if (!secret) {
    throw new TakomoError(
      `Stack ${stack.getPath()} does not contain secret: ${secretName}`,
    )
  }

  const ssm = new SSMClient({
    region: stack.getRegion(),
    credentialProvider: stack.getCredentialProvider(),
    logger: ctx.getLogger(),
  })

  return ssm.getEncryptedParameter(secret.ssmParameterName)
}
