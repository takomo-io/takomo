import { CloudFormationClient } from "@takomo/aws-clients"
import { CommandPath, IO, StackPath } from "@takomo/core"
import {
  CommandContext,
  Stack,
  StackGroup,
  StackOperationVariables,
  StackResult,
} from "@takomo/stacks-model"
import { Logger, StopWatch } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import { StacksOperationOutput } from "../../model"

export interface InitialUndeployContext {
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

export interface ClientTokenHolder extends InitialUndeployContext {
  readonly clientToken: string
}

export interface ResultHolder extends InitialUndeployContext {
  readonly result: StackResult
}

export enum ConfirmUndeployAnswer {
  CANCEL,
  CONTINUE,
}

export interface UndeployStacksIO extends IO {
  chooseCommandPath: (rootStackGroup: StackGroup) => Promise<CommandPath>
  confirmUndeploy: (ctx: CommandContext) => Promise<ConfirmUndeployAnswer>
  printStackEvent: (stackPath: StackPath, e: CloudFormation.StackEvent) => void
  printOutput: (output: StacksOperationOutput) => StacksOperationOutput
}
