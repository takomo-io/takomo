import {
  CloudFormationStack,
  CloudFormationStackSummary,
  DetailedChangeSet,
  DetailedCloudFormationStack,
  StackEvent,
  StackId,
  TemplateBody,
  TemplateSummary,
} from "../../../aws/cloudformation/model.js"
import { ClientRequestToken } from "../../../aws/common/model.js"
import { InternalStacksContext } from "../../../context/stacks-context.js"
import { CommandStatus } from "../../../takomo-core/command.js"
import { StacksConfigRepository } from "../../../takomo-stacks-context/model.js"
import { TkmLogger } from "../../../utils/logging.js"
import {
  StackOperationType,
  StackOperationVariables,
  StackResult,
} from "../../command-model.js"
import { InitialStackOperationState } from "../common/states.js"
import {
  DeployStacksIO,
  DeployState,
  StackParameterInfo,
  StackTagInfo,
} from "./model.js"
import { DeployStackTransitions } from "./transitions.js"

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
  readonly emit: boolean
  readonly skipHooks: boolean
  readonly skipParameters: boolean
  readonly outDir?: string
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
  readonly stackAfterOperation?: CloudFormationStack
  readonly error?: Error
}
