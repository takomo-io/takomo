import { StackPath } from "../../../stacks/stack"
import { StackName, StackStatus } from "../../../takomo-aws-model"
import { CommandInput, IO, ResultsOutput } from "../../../takomo-core/command"
import { CommandPath } from "../../command-model"

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
