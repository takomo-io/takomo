import { Options } from "@takomo/core"
import { SetSecretIO, SetSecretOutput } from "@takomo/stacks-commands"
import { Secret } from "@takomo/stacks-model"
import { CliSecretsIo, SecretOperation } from "./cli-secrets-io"
import { LogWriter } from "@takomo/util"

export class CliSetSecretIO extends CliSecretsIo implements SetSecretIO {
  constructor(options: Options, logWriter: LogWriter = console.log) {
    super(logWriter, options)
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
