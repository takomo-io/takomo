import { CommandInput, CommandOutput, CommandPath, IO } from "@takomo/core"
import { CloudFormation } from "aws-sdk"
import { Stack } from "../../../model"

export interface StackInfo {
  readonly current: CloudFormation.Stack | null
  readonly stack: Stack
}

export interface ListStacksInput extends CommandInput {
  commandPath: CommandPath
}

export interface ListStacksOutput extends CommandOutput {
  stacks: StackInfo[]
}

export interface ListStacksIO extends IO {
  printOutput(output: ListStacksOutput): ListStacksOutput
}
