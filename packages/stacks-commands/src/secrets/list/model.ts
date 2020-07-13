import { CommandInput, CommandOutput, CommandPath, IO } from "@takomo/core"
import { StackSecrets } from "../../model"

export interface ListSecretsInput extends CommandInput {
  commandPath: CommandPath
}

export interface ListSecretsOutput extends CommandOutput {
  stacks: StackSecrets[]
}

export interface ListSecretsIO extends IO {
  printOutput(output: ListSecretsOutput): ListSecretsOutput
}
