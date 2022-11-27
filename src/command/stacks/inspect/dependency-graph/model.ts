import { InternalStack } from "../../../../stacks/stack"
import {
  CommandInput,
  CommandOutput,
  IO,
} from "../../../../takomo-core/command"
import { CommandPath } from "../../../command-model"

export interface DependencyGraphInput extends CommandInput {
  readonly commandPath: CommandPath
}

export interface DependencyGraphOutput extends CommandOutput {
  readonly stacks: ReadonlyArray<InternalStack>
}

export type DependencyGraphIO = IO<DependencyGraphOutput>
