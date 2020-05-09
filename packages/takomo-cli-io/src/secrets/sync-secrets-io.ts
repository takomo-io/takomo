import { Options } from "@takomo/core"
import { Secret } from "@takomo/stacks"
import {
  StackSecretsDiff,
  SyncSecretsIO,
  SyncSecretsOutput,
} from "@takomo/stacks-commands"
import { CliSecretsIo, SecretOperation } from "./cli-secrets-io"
export class CliSyncSecretsIO extends CliSecretsIo implements SyncSecretsIO {
  constructor(options: Options) {
    super(options)
  }

  printOutput = (output: SyncSecretsOutput): SyncSecretsOutput => {
    this.message(output.success)
    return output
  }

  promptSecretValue = async (secret: Secret): Promise<string> => {
    this.printSecret(secret, SecretOperation.ADD)
    return this.question("Enter value", true)
  }

  confirmSync = async (stacks: StackSecretsDiff[]): Promise<boolean> => {
    this.message("Found secrets to sync", true)
    this.printSecretsDiff(stacks)

    this.longMessage(
      [
        "The secrets that are found from the AWS parameter store but not",
        "from the local stack configurations will be removed.",
        "",
        "You will need to provide values for the secrets found from",
        "the local stack configurations but not from the AWS parameter store.",
      ],
      true,
      true,
    )

    return this.confirm("Continue sync?")
  }
}
