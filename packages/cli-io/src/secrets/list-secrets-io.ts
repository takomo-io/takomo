import { Options } from "@takomo/core"
import { ListSecretsIO, ListSecretsOutput } from "@takomo/stacks-commands"
import { CliSecretsIo } from "./cli-secrets-io"
import { LogWriter } from "@takomo/util"

export class CliListSecretsIO extends CliSecretsIo implements ListSecretsIO {
  constructor(options: Options, logWriter: LogWriter = console.log) {
    super(logWriter, options)
  }

  printOutput = (output: ListSecretsOutput): ListSecretsOutput => {
    output.stacks.forEach((stack) => {
      if (stack.secrets.length === 0) {
        return
      }

      this.message(stack.stack.getPath(), true)
      stack.secrets.forEach((s) => this.printSecret(s))
    })

    return output
  }
}
