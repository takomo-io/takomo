import { StackName, StackStatus } from "../../../aws/cloudformation/model.js"
import { StackPath } from "../../../stacks/stack.js"
import {
  CommandInput,
  IO,
  ResultsOutput,
} from "../../../takomo-core/command.js"
import { CommandPath } from "../../command-model.js"

export interface StackInfo {
  readonly path: StackPath
  readonly name: StackName
  readonly status?: StackStatus
  readonly createdTime?: Date
  readonly updatedTime?: Date
}

export interface ListStacksInput extends CommandInput {
  readonly commandPath: CommandPath
}

export type ListStacksOutput = ResultsOutput<StackInfo>

export type ListStacksIO = IO<ListStacksOutput>
