import { CloudFormationClient } from "@takomo/aws-clients"
import { CommandPath, IO, StackPath } from "@takomo/core"
import {
  CommandContext,
  Stack,
  StackGroup,
  StackLaunchType,
  StackOperationVariables,
  StackResult,
} from "@takomo/stacks-model"
import { Logger, StopWatch } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import { DescribeChangeSetOutput } from "aws-sdk/clients/cloudformation"
import { StacksOperationOutput } from "../../model"

export enum ConfirmDeployAnswer {
  CANCEL,
  CONTINUE_AND_REVIEW,
  CONTINUE_NO_REVIEW,
}

export enum ConfirmStackDeployAnswer {
  CANCEL,
  REVIEW_TEMPLATE,
  CONTINUE,
  CONTINUE_AND_SKIP_REMAINING_REVIEWS,
}

export interface DeployStacksIO extends IO {
  chooseCommandPath: (rootStackGroup: StackGroup) => Promise<CommandPath>
  confirmStackDeploy: (
    stack: Stack,
    changeSet: DescribeChangeSetOutput,
    templateBody: string,
    templateSummary: CloudFormation.GetTemplateSummaryOutput,
    cloudFormationClient: CloudFormationClient,
    existingStack: CloudFormation.Stack | null,
    existingTemplateSummary: CloudFormation.GetTemplateSummaryOutput | null,
  ) => Promise<ConfirmStackDeployAnswer>
  confirmDeploy: (ctx: CommandContext) => Promise<ConfirmDeployAnswer>
  printOutput: (output: StacksOperationOutput) => StacksOperationOutput
  printStackEvent: (stackPath: StackPath, e: CloudFormation.StackEvent) => void
}

export interface DeployState {
  cancelled: boolean
  autoConfirm: boolean
}

export interface InitialLaunchContext {
  readonly stack: Stack
  readonly existingStack: CloudFormation.Stack | null
  readonly existingTemplateSummary: CloudFormation.GetTemplateSummaryOutput | null
  readonly launchType: StackLaunchType
  readonly watch: StopWatch
  readonly logger: Logger
  readonly ctx: CommandContext
  readonly dependencies: Promise<StackResult>[]
  readonly cloudFormationClient: CloudFormationClient
  readonly io: DeployStacksIO
  readonly variables: StackOperationVariables
  readonly state: DeployState
}

export interface TemplateBodyHolder extends InitialLaunchContext {
  readonly templateBody: string
}

export interface TemplateLocationHolder extends TemplateBodyHolder {
  readonly templateS3Url: string | null
}

export interface TemplateSummaryHolder extends TemplateLocationHolder {
  readonly templateSummary: CloudFormation.GetTemplateSummaryOutput
}

export interface ParameterHolder extends TemplateSummaryHolder {
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
