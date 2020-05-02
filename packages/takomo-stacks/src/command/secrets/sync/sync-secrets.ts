import { SSMClient } from "@takomo/aws-clients"
import { CommandStatus } from "@takomo/core"
import { CommandContext } from "../../../context"
import { SyncSecretsInput, SyncSecretsIO, SyncSecretsOutput } from "./model"

export const syncSecrets = async (
  ctx: CommandContext,
  input: SyncSecretsInput,
  io: SyncSecretsIO,
): Promise<SyncSecretsOutput> => {
  const watch = input.watch
  const autoConfirm = input.options.isAutoConfirmEnabled()
  const stackSecrets = await Promise.all(
    ctx.getStacksToProcess().map(async (stack) => {
      const ssm = new SSMClient({
        credentialProvider: stack.getCredentialProvider(),
        region: stack.getRegion(),
        logger: io,
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
      )
        .filter(
          (secret) => !ssmParameterNames.includes(secret.ssmParameterName),
        )
        .map((s) => ({
          name: s.name,
          ssmParameterName: s.ssmParameterName,
          description: s.description,
        }))

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

  const stacksToSync = stackSecrets.filter(
    (s) => s.add.length + s.remove.length > 0,
  )
  if (stacksToSync.length === 0) {
    return {
      success: true,
      stacks: [],
      message: "Success",
      status: CommandStatus.SUCCESS,
      watch,
    }
  }

  if (!autoConfirm && !io.confirmSync(stacksToSync)) {
    return {
      success: true,
      message: "Cancelled",
      stacks: [],
      status: CommandStatus.CANCELLED,
      watch: watch.stop(),
    }
  }

  await Promise.all(
    stacksToSync.map(async (diff) => {
      const ssm = new SSMClient({
        credentialProvider: diff.stack.getCredentialProvider(),
        region: diff.stack.getRegion(),
        logger: io,
      })

      const parametersToRemove = diff.remove.map((p) => p.ssmParameterName)

      if (parametersToRemove.length > 0) {
        await ssm.deleteParameters(parametersToRemove)
      }

      return true
    }),
  )

  for (const diff of stacksToSync) {
    if (diff.add.length === 0) {
      break
    }

    io.info(`${diff.stack.getPath()}`)
    io.info()

    const ssm = new SSMClient({
      credentialProvider: diff.stack.getCredentialProvider(),
      region: diff.stack.getRegion(),
      logger: ctx.getLogger(),
    })

    for (const secret of diff.add) {
      const value = await io.promptSecretValue(secret)
      await ssm.putEncryptedParameter(
        secret.ssmParameterName,
        value,
        secret.description,
      )
    }
  }

  return {
    success: true,
    message: "Success",
    stacks: stacksToSync,
    status: CommandStatus.SUCCESS,
    watch: watch.stop(),
  }
}
