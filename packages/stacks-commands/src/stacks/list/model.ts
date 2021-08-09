import { StackName, StackStatus } from "@takomo/aws-model"
import { CommandInput, CommandOutput, IO } from "@takomo/core"
import { CommandPath, StackPath } from "@takomo/stacks-model"

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

export interface ListStacksOutput extends CommandOutput {
  readonly stacks: ReadonlyArray<StackInfo>
}

export type ListStacksIO = IO<ListStacksOutput>
