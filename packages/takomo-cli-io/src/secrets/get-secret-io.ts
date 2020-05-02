import { Options } from "@takomo/core"
import { GetSecretIO, GetSecretOutput } from "@takomo/stacks"
import { CliSecretsIo } from "./cli-secrets-io"

export class CliGetSecretIO extends CliSecretsIo implements GetSecretIO {
  constructor(options: Options) {
    super(options)
  }

  printOutput = (output: GetSecretOutput): GetSecretOutput => {
    this.message(output.value)
    return output
  }
}
