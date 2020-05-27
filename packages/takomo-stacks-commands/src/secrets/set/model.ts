import { CommandInput, CommandOutput, IO, StackPath } from "@takomo/core"
import { Secret, SecretName } from "@takomo/stacks-model"

export interface SetSecretInput extends CommandInput {
  stackPath: StackPath
  secretName: SecretName
}

export interface SetSecretIO extends IO {
  promptSecretValue: (secret: Secret) => Promise<string>

  printOutput(output: SetSecretOutput): SetSecretOutput
}

export type SetSecretOutput = CommandOutput
