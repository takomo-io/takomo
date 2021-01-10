import { CloudFormationStack } from "@takomo/aws-model"
import { CommandInput, CommandOutput, IO } from "@takomo/core"
import { CommandPath, InternalStack } from "@takomo/stacks-model"

export interface StackInfo {
  readonly current?: CloudFormationStack
  readonly stack: InternalStack
}

export interface ListStacksInput extends CommandInput {
  readonly commandPath: CommandPath
}

export interface ListStacksOutput extends CommandOutput {
  readonly stacks: ReadonlyArray<StackInfo>
}

export type ListStacksIO = IO<ListStacksOutput>
