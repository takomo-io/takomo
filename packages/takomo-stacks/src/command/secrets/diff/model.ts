import { CommandInput, CommandOutput, CommandPath, IO } from "@takomo/core"
import { StackSecretsDiff } from "../../../model"

export interface DiffSecretsInput extends CommandInput {
  commandPath: CommandPath
}

export interface DiffSecretsOutput extends CommandOutput {
  stacks: StackSecretsDiff[]
}

export interface DiffSecretsIO extends IO {
  printOutput(output: DiffSecretsOutput): DiffSecretsOutput
}
