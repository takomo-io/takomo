import { InternalStandardStack } from "../../../../stacks/standard-stack.js"
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
  readonly stacks: ReadonlyArray<InternalStandardStack>
}

export type DependencyGraphIO = IO<DependencyGraphOutput>
