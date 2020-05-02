import { CloudFormationClient } from "@takomo/aws-clients"
import { CommandPath, ConfirmResult, IO, StackPath } from "@takomo/core"
import { Logger, StopWatch } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import { CommandContext } from "../../../context"
import {
  Stack,
  StackGroup,
  StackOperationVariables,
  StackResult,
  StacksOperationOutput,
} from "../../../model"

export interface InitialDeleteContext {
  readonly stack: Stack
  readonly watch: StopWatch
  readonly ctx: CommandContext
  readonly logger: Logger
  readonly dependants: Promise<StackResult>[]
  readonly cloudFormationClient: CloudFormationClient
  readonly io: UndeployStacksIO
  readonly variables: StackOperationVariables
}

export interface StackInfo {
  readonly status: CloudFormation.StackStatus
  readonly stackId: CloudFormation.StackId
}

export interface TargetStackInfoHolder extends InitialDeleteContext {
  readonly current: StackInfo
}

export interface ClientTokenHolder extends TargetStackInfoHolder {
  readonly clientToken: string
}

export interface ResultHolder extends TargetStackInfoHolder {
  readonly result: StackResult
}

export interface UndeployStacksIO extends IO {
  chooseCommandPath: (rootStackGroup: StackGroup) => Promise<CommandPath>
  confirmDelete: (ctx: CommandContext) => Promise<ConfirmResult>
  printStackEvent: (stackPath: StackPath, e: CloudFormation.StackEvent) => void
  printOutput: (output: StacksOperationOutput) => StacksOperationOutput
}
