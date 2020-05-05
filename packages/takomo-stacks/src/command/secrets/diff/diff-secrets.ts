import { SSMClient } from "@takomo/aws-clients"
import { CommandContext } from "../../../context"
import { StackSecretsDiff } from "../../../model"

export const diffSecrets = async (
  ctx: CommandContext,
): Promise<StackSecretsDiff[]> => {
  const stackSecrets = await Promise.all(
    ctx.getStacksToProcess().map(async (stack) => {
      const ssm = new SSMClient({
        credentialProvider: stack.getCredentialProvider(),
        region: stack.getRegion(),
        logger: ctx.getLogger(),
      })

      const secretsInParameterStore = await ssm.getEncryptedParametersByPath(
        stack.getSecretsPath(),
      )
      const ssmParameterNames = secretsInParameterStore.map((s) => s.Name!)

      if (
        stack.getSecrets().size === 0 &&
        secretsInParameterStore.length === 0
      ) {
        return {
          stack,
          add: [],
          remove: [],
        }
      }

      const secretsNotFoundFromParameterStore = Array.from(
        stack.getSecrets().values(),
      ).filter((secret) => !ssmParameterNames.includes(secret.ssmParameterName))

      const secretsNotFoundFromStackConfig = await Promise.all(
        secretsInParameterStore
          .filter((ssmParameter) => {
            return !Array.from(stack.getSecrets().values())
              .map((s) => s.ssmParameterName)
              .includes(ssmParameter.Name!)
          })
          .map(async (s) => ({
            name: s.Name!.split("/").reverse()[0],
            ssmParameterName: s.Name!,
            description: await ssm.getParameterDescription(s.Name!),
          })),
      )

      return {
        stack,
        add: secretsNotFoundFromParameterStore,
        remove: secretsNotFoundFromStackConfig,
      }
    }),
  )

  return stackSecrets.filter((s) => s.add.length + s.remove.length > 0)
}
