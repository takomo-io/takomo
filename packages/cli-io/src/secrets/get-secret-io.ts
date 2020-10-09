import { Options } from "@takomo/core"
import { GetSecretIO, GetSecretOutput } from "@takomo/stacks-commands"
import { CliSecretsIo } from "./cli-secrets-io"
import { LogWriter } from "@takomo/util"

export class CliGetSecretIO extends CliSecretsIo implements GetSecretIO {
  constructor(options: Options, logWriter: LogWriter = console.log) {
    super(logWriter, options)
  }

  printOutput = (output: GetSecretOutput): GetSecretOutput => {
    this.message(output.value)
    return output
  }
}
