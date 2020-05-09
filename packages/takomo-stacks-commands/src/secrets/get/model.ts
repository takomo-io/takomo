import { CommandInput, CommandOutput, IO, StackPath } from "@takomo/core"
import { SecretName } from "@takomo/stacks"

export interface GetSecretInput extends CommandInput {
  stackPath: StackPath
  secretName: SecretName
}

export interface GetSecretOutput extends CommandOutput {
  value: string | null
}

export interface GetSecretIO extends IO {
  printOutput(output: GetSecretOutput): GetSecretOutput
}
