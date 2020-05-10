import { CloudFormationClient } from "@takomo/aws-clients"
import { CommandPath, ConfirmResult, IO, StackPath } from "@takomo/core"
import {
  CommandContext,
  Stack,
  StackGroup,
  StackOperationVariables,
  StackResult,
} from "@takomo/stacks"
import { Logger, StopWatch } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import { StacksOperationOutput } from "../../model"

export interface InitialDeleteContext {
  readonly stack: Stack
  readonly existingStack: CloudFormation.Stack | null
  readonly watch: StopWatch
  readonly ctx: CommandContext
  readonly logger: Logger
  readonly dependants: Promise<StackResult>[]
  readonly cloudFormationClient: CloudFormationClient
  readonly io: UndeployStacksIO
  readonly variables: StackOperationVariables
}

export interface ClientTokenHolder extends InitialDeleteContext {
  readonly clientToken: string
}

export interface ResultHolder extends InitialDeleteContext {
  readonly result: StackResult
}

export interface UndeployStacksIO extends IO {
  chooseCommandPath: (rootStackGroup: StackGroup) => Promise<CommandPath>
  confirmDelete: (ctx: CommandContext) => Promise<ConfirmResult>
  printStackEvent: (stackPath: StackPath, e: CloudFormation.StackEvent) => void
  printOutput: (output: StacksOperationOutput) => StacksOperationOutput
}
