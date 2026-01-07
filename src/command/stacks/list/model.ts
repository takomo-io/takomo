import { StackName, StackStatus } from "../../../aws/cloudformation/model.js"
import { CustomStackStatus } from "../../../stacks/custom-stack.js"
import { StackPath } from "../../../stacks/stack.js"
import {
  CommandInput,
  IO,
  ResultsOutput,
} from "../../../takomo-core/command.js"
import { CommandPath } from "../../command-model.js"

type BaseStackInfo = {
  readonly type: "custom" | "standard"
  readonly path: StackPath
  readonly name: StackName
  readonly status?: StackStatus | CustomStackStatus
  readonly createdTime?: Date
  readonly updatedTime?: Date
}

export type CustomStackInfo = BaseStackInfo & {
  readonly type: "custom"
  readonly status: CustomStackStatus
}

export type StandardStackInfo = BaseStackInfo & {
  readonly type: "standard"
  readonly status?: StackStatus
}

export type StackInfo = CustomStackInfo | StandardStackInfo

export interface ListStacksInput extends CommandInput {
  readonly commandPath: CommandPath
}

export type ListStacksOutput = ResultsOutput<StackInfo>

export type ListStacksIO = IO<ListStacksOutput>
