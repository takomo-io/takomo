import { InternalStack } from "../../../../stacks/stack.js"
import {
  CommandInput,
  CommandOutput,
  IO,
} from "../../../../takomo-core/command.js"
import { CommandPath } from "../../../command-model.js"

export interface DependencyGraphInput extends CommandInput {
  readonly commandPath: CommandPath
}

export interface DependencyGraphOutput extends CommandOutput {
  readonly stacks: ReadonlyArray<InternalStack>
}

export type DependencyGraphIO = IO<DependencyGraphOutput>
