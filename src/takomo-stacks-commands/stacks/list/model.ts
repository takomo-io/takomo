import { StackName, StackStatus } from "../../../takomo-aws-model"
import { CommandInput, IO, ResultsOutput } from "../../../takomo-core"
import { CommandPath, StackPath } from "../../../takomo-stacks-model"

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
