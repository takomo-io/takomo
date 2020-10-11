import { CommandInput, CommandOutput, CommandPath, IO } from "@takomo/core"
import { Stack } from "@takomo/stacks-model"

export interface DependencyGraphInput extends CommandInput {
  commandPath: CommandPath
}

export interface DependencyGraphOutput extends CommandOutput {
  stacks: Stack[]
}

export interface DependencyGraphIO extends IO {
  printOutput(output: DependencyGraphOutput): DependencyGraphOutput
}
