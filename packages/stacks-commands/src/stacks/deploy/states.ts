import {
  ClientRequestToken,
  CloudFormationStack,
  DetailedChangeSet,
  DetailedCloudFormationStack,
  StackEvent,
  StackId,
  TemplateBody,
  TemplateSummary,
} from "@takomo/aws-model"
import { CommandStatus } from "@takomo/core"
import { StacksConfigRepository } from "@takomo/stacks-context"
import {
  InternalStacksContext,
  StackOperationVariables,
  StackResult,
} from "@takomo/stacks-model"
import { TkmLogger } from "@takomo/util"
import { InitialStackOperationState } from "../common/states"
import {
  DeployStacksIO,
  DeployState,
  StackParameterInfo,
  StackTagInfo,
} from "./model"
import { StackDeployOperationType } from "./plan"
import { DeployStackTransitions } from "./transitions"

/**
 * @hidden
 */
export interface InitialDeployStackState extends InitialStackOperationState {
  readonly io: DeployStacksIO
  readonly ctx: InternalStacksContext
  readonly configRepository: StacksConfigRepository
  readonly variables: StackOperationVariables
  readonly logger: TkmLogger
  readonly currentStack?: CloudFormationStack
  readonly dependencies: ReadonlyArray<Promise<StackResult>>
  readonly operationType: StackDeployOperationType
  readonly state: DeployState
  readonly transitions: DeployStackTransitions
}

/**
 * @hidden
 */
export interface CurrentStackHolder extends InitialDeployStackState {
  readonly currentStack: CloudFormationStack
}

/**
 * @hidden
 */
export interface DetailedCurrentStackHolder extends InitialDeployStackState {
  readonly currentStack?: DetailedCloudFormationStack
}

/**
 * @hidden
 */
export interface DeleteFailedStackClientTokenHolder
  extends InitialDeployStackState {
  readonly deleteFailedStackClientToken: string
  readonly currentStack: CloudFormationStack
}

/**
 * @hidden
 */
export interface ParametersHolder extends DetailedCurrentStackHolder {
  readonly parameters: ReadonlyArray<StackParameterInfo>
}

/**
 * @hidden
 */
export interface TagsHolder extends ParametersHolder {
  readonly tags: ReadonlyArray<StackTagInfo>
}

/**
 * @hidden
 */
export interface TemplateBodyHolder extends TagsHolder {
  readonly templateBody: TemplateBody
}

/**
 * @hidden
 */
export interface TemplateLocationHolder extends TemplateBodyHolder {
  readonly templateS3Url?: string
}

/**
 * @hidden
 */
export interface TemplateSummaryHolder extends TemplateLocationHolder {
  readonly templateSummary: TemplateSummary
}

/**
 * @hidden
 */
export interface ChangeSetNameHolder extends TemplateSummaryHolder {
  readonly changeSetName: string
}

/**
 * @hidden
 */
export interface UpdateStackHolder extends TemplateLocationHolder {
  readonly currentStack: DetailedCloudFormationStack
  readonly terminationProtectionUpdated: boolean
}

/**
 * @hidden
 */
export interface ChangeSetHolder extends ChangeSetNameHolder {
  readonly changeSet?: DetailedChangeSet
}

/**
 * @hidden
 */
export interface StackOperationClientTokenHolder extends TagsHolder {
  readonly clientToken: ClientRequestToken
  readonly stackId: StackId
}

/**
 * @hidden
 */
export interface StackOperationResultHolder extends InitialDeployStackState {
  readonly message: string
  readonly success: boolean
  readonly status: CommandStatus
  readonly events: ReadonlyArray<StackEvent>
  readonly error?: Error
}
