import { CommandInput, CommandOutput } from "@takomo/core"
import { CommandPath, StackResult } from "@takomo/stacks-model"

export interface StacksOperationInput extends CommandInput {
  readonly commandPath: CommandPath
  readonly ignoreDependencies: boolean
  readonly interactive: boolean
}

export interface StacksOperationOutput extends CommandOutput {
  readonly results: ReadonlyArray<StackResult>
}
