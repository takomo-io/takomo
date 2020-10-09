import { Options } from "@takomo/core"
import { DiffSecretsIO, DiffSecretsOutput } from "@takomo/stacks-commands"
import { CliSecretsIo } from "./cli-secrets-io"
import { LogWriter } from "@takomo/util"

export class CliDiffSecretsIO extends CliSecretsIo implements DiffSecretsIO {
  constructor(options: Options, logWriter: LogWriter = console.log) {
    super(logWriter, options)
  }

  printOutput = (output: DiffSecretsOutput): DiffSecretsOutput => {
    if (output.stacks.length === 0) {
      this.message(`All secrets in sync`, true, true)
      return output
    }

    this.message(`Found secrets to sync`, true)
    this.printSecretsDiff(output.stacks)

    return output
  }
}
