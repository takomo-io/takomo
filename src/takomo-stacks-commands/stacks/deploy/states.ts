import {
  ClientRequestToken,
  CloudFormationStackSummary,
  DetailedChangeSet,
  DetailedCloudFormationStack,
  StackId,
  TemplateBody,
  TemplateSummary,
} from "../../../takomo-aws-model"
import { StackEvent } from "../../../takomo-aws-model/cloudformation"
import { CommandStatus } from "../../../takomo-core"
import { StacksConfigRepository } from "../../../takomo-stacks-context"
import {
  InternalStacksContext,
  StackOperationType,
  StackOperationVariables,
  StackResult,
} from "../../../takomo-stacks-model"
import { TkmLogger } from "../../../takomo-util"
import { InitialStackOperationState } from "../common/states"
import {
  DeployStacksIO,
  DeployState,
  StackParameterInfo,
  StackTagInfo,
} from "./model"
import { DeployStackTransitions } from "./transitions"

export interface InitialDeployStackState extends InitialStackOperationState {
  readonly io: DeployStacksIO
  readonly ctx: InternalStacksContext
  readonly configRepository: StacksConfigRepository
  readonly variables: StackOperationVariables
  readonly logger: TkmLogger
  readonly currentStack?: CloudFormationStackSummary
  readonly dependencies: ReadonlyArray<Promise<StackResult>>
  readonly operationType: StackOperationType
  readonly state: DeployState
  readonly transitions: DeployStackTransitions
  readonly expectNoChanges: boolean
}

export interface CurrentStackHolder extends InitialDeployStackState {
  readonly currentStack: CloudFormationStackSummary
}

export interface DetailedCurrentStackHolder extends InitialDeployStackState {
  readonly currentStack?: DetailedCloudFormationStack
}

export interface DeleteFailedStackClientTokenHolder
  extends InitialDeployStackState {
  readonly deleteFailedStackClientToken: ClientRequestToken
  readonly currentStack: CloudFormationStackSummary
}

export interface ContinueStackRollbackClientTokenHolder
  extends InitialDeployStackState {
  readonly continueStackRollbackClientToken: ClientRequestToken
  readonly currentStack: CloudFormationStackSummary
}

export interface ParametersHolder extends DetailedCurrentStackHolder {
  readonly parameters: ReadonlyArray<StackParameterInfo>
}

export interface TagsHolder extends ParametersHolder {
  readonly tags: ReadonlyArray<StackTagInfo>
}

export interface TemplateBodyHolder extends TagsHolder {
  readonly templateBody: TemplateBody
}

export interface TemplateLocationHolder extends TemplateBodyHolder {
  readonly templateS3Url?: string
}

export interface TemplateSummaryHolder extends TemplateLocationHolder {
  readonly templateSummary: TemplateSummary
}

export interface ChangeSetNameHolder extends TemplateSummaryHolder {
  readonly changeSetName: string
}

export interface UpdateStackHolder extends TemplateLocationHolder {
  readonly currentStack: DetailedCloudFormationStack
  readonly terminationProtectionUpdated: boolean
}

export interface ChangeSetHolder extends ChangeSetNameHolder {
  readonly changeSet?: DetailedChangeSet
}

export interface StackOperationClientTokenHolder extends TagsHolder {
  readonly clientToken: ClientRequestToken
  readonly stackId: StackId
}

export interface StackOperationResultHolder extends InitialDeployStackState {
  readonly message: string
  readonly success: boolean
  readonly status: CommandStatus
  readonly events: ReadonlyArray<StackEvent>
  readonly error?: Error
}
