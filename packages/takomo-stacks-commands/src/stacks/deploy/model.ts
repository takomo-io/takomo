import { CloudFormationClient } from "@takomo/aws-clients"
import { CommandPath, ConfirmResult, IO, StackPath } from "@takomo/core"
import {
  CommandContext,
  Stack,
  StackGroup,
  StackLaunchType,
  StackOperationVariables,
  StackResult,
} from "@takomo/stacks"
import { Logger, StopWatch } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import { DescribeChangeSetOutput } from "aws-sdk/clients/cloudformation"
import { StacksOperationOutput } from "../../model"

export interface DeployStacksIO extends IO {
  chooseCommandPath(rootStackGroup: StackGroup): Promise<CommandPath>
  confirmStackLaunch: (
    stack: Stack,
    changeSet: DescribeChangeSetOutput,
    templateBody: string,
    cloudFormationClient: CloudFormationClient,
  ) => Promise<ConfirmResult>
  confirmLaunch: (ctx: CommandContext) => Promise<ConfirmResult>
  printOutput: (output: StacksOperationOutput) => StacksOperationOutput
  printStackEvent: (stackPath: StackPath, e: CloudFormation.StackEvent) => void
}

export interface StackInfo {
  readonly status: CloudFormation.StackStatus
  readonly stackId: CloudFormation.StackId
}

export interface InitialLaunchContext {
  readonly stack: Stack
  readonly existingStack: CloudFormation.Stack | null
  readonly launchType: StackLaunchType
  readonly watch: StopWatch
  readonly logger: Logger
  readonly ctx: CommandContext
  readonly dependencies: Promise<StackResult>[]
  readonly cloudFormationClient: CloudFormationClient
  readonly io: DeployStacksIO
  readonly variables: StackOperationVariables
}

export interface DeleteStackClientTokenHolder extends InitialLaunchContext {
  readonly clientToken: string
}

export interface TemplateBodyHolder extends InitialLaunchContext {
  readonly templateBody: string
}

export interface TemplateLocationHolder extends TemplateBodyHolder {
  readonly templateS3Url: string | null
}

export interface ParameterHolder extends TemplateLocationHolder {
  readonly parameters: CloudFormation.Parameter[]
}

export interface TagsHolder extends ParameterHolder {
  readonly tags: CloudFormation.Tag[]
}

export interface ClientTokenHolder extends TagsHolder {
  readonly clientToken: string
}

export interface ResultHolder extends ClientTokenHolder {
  readonly result: StackResult
}
