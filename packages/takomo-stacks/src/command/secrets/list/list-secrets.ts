import { SSMClient } from "@takomo/aws-clients"
import { CommandContext } from "../../../context"
import { StackSecrets } from "../../../model"

export const listSecrets = async (
  ctx: CommandContext,
): Promise<StackSecrets[]> => {
  return Promise.all(
    ctx.getStacksToProcess().map(async (stack) => {
      if (stack.getSecrets().size === 0) {
        return {
          stack,
          secrets: [],
        }
      }

      const ssm = new SSMClient({
        region: stack.getRegion(),
        credentialProvider: stack.getCredentialProvider(),
        logger: ctx.getLogger(),
      })

      const secrets = await Promise.all(
        Array.from(stack.getSecrets().entries()).map(async (entry) => {
          const [secretName, secret] = entry
          const value = await ssm.getEncryptedParameter(secret.ssmParameterName)
          return {
            name: secretName,
            ssmParameterName: secret.ssmParameterName,
            description: secret.description,
            value,
          }
        }),
      )

      return {
        stack,
        secrets,
      }
    }),
  )
}
