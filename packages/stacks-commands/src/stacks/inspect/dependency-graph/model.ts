import { CommandInput, CommandOutput, IO } from "@takomo/core"
import { CommandPath, InternalStack } from "@takomo/stacks-model"

export interface DependencyGraphInput extends CommandInput {
  readonly commandPath: CommandPath
}

export interface DependencyGraphOutput extends CommandOutput {
  readonly stacks: ReadonlyArray<InternalStack>
}

export type DependencyGraphIO = IO<DependencyGraphOutput>
