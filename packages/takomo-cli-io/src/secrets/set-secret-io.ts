import { Options } from "@takomo/core"
import { Secret } from "@takomo/stacks"
import { SetSecretIO, SetSecretOutput } from "@takomo/stacks-commands"
import { CliSecretsIo, SecretOperation } from "./cli-secrets-io"

export class CliSetSecretIO extends CliSecretsIo implements SetSecretIO {
  constructor(options: Options) {
    super(options)
  }

  promptSecretValue = async (secret: Secret): Promise<string> => {
    this.printSecret(secret, SecretOperation.ADD)
    return this.question("Enter value", true)
  }

  printOutput = (output: SetSecretOutput): SetSecretOutput => {
    this.message(output.success)
    return output
  }
}
