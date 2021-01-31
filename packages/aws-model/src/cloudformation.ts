import { ClientRequestToken, Tag } from "./common"

/**
 * CloudFormation stack id.
 */
export type StackId = string

/**
 * CloudFormation stack name.
 */
export type StackName = string

/**
 * CloudFormation stack status.
 */
export type StackStatus =
  | "CREATE_IN_PROGRESS"
  | "CREATE_FAILED"
  | "CREATE_COMPLETE"
  | "ROLLBACK_IN_PROGRESS"
  | "ROLLBACK_FAILED"
  | "ROLLBACK_COMPLETE"
  | "DELETE_IN_PROGRESS"
  | "DELETE_FAILED"
  | "DELETE_COMPLETE"
  | "UPDATE_IN_PROGRESS"
  | "UPDATE_COMPLETE_CLEANUP_IN_PROGRESS"
  | "UPDATE_COMPLETE"
  | "UPDATE_ROLLBACK_IN_PROGRESS"
  | "UPDATE_ROLLBACK_FAILED"
  | "UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS"
  | "UPDATE_ROLLBACK_COMPLETE"
  | "REVIEW_IN_PROGRESS"
  | "IMPORT_IN_PROGRESS"
  | "IMPORT_COMPLETE"
  | "IMPORT_ROLLBACK_IN_PROGRESS"
  | "IMPORT_ROLLBACK_FAILED"
  | "IMPORT_ROLLBACK_COMPLETE"

/**
 * CloudFormation stack status reason.
 */
export type StackStatusReason = string

/**
 * CloudFormation stack termination protection.
 */
export type EnableTerminationProtection = boolean

/**
 * CloudFormation stack capability.
 */
export type StackCapability =
  | "CAPABILITY_IAM"
  | "CAPABILITY_NAMED_IAM"
  | "CAPABILITY_AUTO_EXPAND"

/**
 * CloudFormation stack parameter key.
 */
export type StackParameterKey = string

/**
 * CloudFormation stack parameter value.
 */
export type StackParameterValue = string

/**
 * CloudFormation stack parameter value.
 */
export type StackParameterNoEcho = boolean

/**
 * CloudFormation stack parameter description.
 */
export type StackParameterDescription = string

/**
 * CloudFormation stack parameter.
 */
export interface StackParameter {
  readonly key: StackParameterKey
  readonly value: StackParameterValue
}

/**
 * CloudFormation parameter declaration.
 */
export interface ParameterDeclaration {
  readonly key: StackParameterKey
  readonly description: StackParameterDescription
  readonly noEcho: StackParameterNoEcho
  readonly defaultValue?: StackParameterValue
}

/**
 * Detailed CloudFormation stack parameter.
 */
export type DetailedStackParameter = StackParameter & ParameterDeclaration

/**
 * CloudFormation stack output value.
 */
export type StackOutputValue = string

/**
 * CloudFormation stack output key.
 */
export type StackOutputKey = string

/**
 * CloudFormation stack output description.
 */
export type StackOutputDescription = string

/**
 * CloudFormation stack output.
 */
export interface StackOutput {
  readonly value: StackOutputValue
  readonly key: StackOutputKey
  readonly description: StackOutputDescription
}

/**
 * CloudFormation stack creation time.
 */
export type CreationTime = Date

/**
 * CloudFormation stack last updated time.
 */
export type LastUpdatedTime = Date

interface BaseCloudFormationStack<P> {
  readonly id: StackId
  readonly name: StackName
  readonly parameters: ReadonlyArray<P>
  readonly status: StackStatus
  readonly statusReason: StackStatusReason
  readonly capabilities: ReadonlyArray<StackCapability>
  readonly enableTerminationProtection: EnableTerminationProtection
  readonly creationTime: CreationTime
  readonly lastUpdatedTime?: LastUpdatedTime
  readonly outputs: ReadonlyArray<StackOutput>
  readonly tags: ReadonlyArray<Tag>
}

/**
 * CloudFormation stack.
 */
export type CloudFormationStack = BaseCloudFormationStack<StackParameter>

/**
 * CloudFormation stack template.
 */
export type TemplateBody = string

/**
 * Detailed CloudFormation stack.
 */
export interface DetailedCloudFormationStack
  extends BaseCloudFormationStack<DetailedStackParameter> {
  readonly templateBody: TemplateBody
}

export interface TemplateSummary {
  readonly parameters: ReadonlyArray<ParameterDeclaration>
}

export type LogicalResourceId = string
export type PhysicalResourceId = string
export type ResourceType = string
export type ResourceProperties = string
export type ResourceStatusReason = string
export type ResourceStatus =
  | "CREATE_IN_PROGRESS"
  | "CREATE_FAILED"
  | "CREATE_COMPLETE"
  | "DELETE_IN_PROGRESS"
  | "DELETE_FAILED"
  | "DELETE_COMPLETE"
  | "DELETE_SKIPPED"
  | "UPDATE_IN_PROGRESS"
  | "UPDATE_FAILED"
  | "UPDATE_COMPLETE"
  | "IMPORT_FAILED"
  | "IMPORT_COMPLETE"
  | "IMPORT_IN_PROGRESS"
  | "IMPORT_ROLLBACK_IN_PROGRESS"
  | "IMPORT_ROLLBACK_FAILED"
  | "IMPORT_ROLLBACK_COMPLETE"

export type EventId = string

export interface StackEvent {
  id: EventId
  stackId: StackId
  stackName: StackName
  logicalResourceId: LogicalResourceId
  physicalResourceId?: PhysicalResourceId
  resourceType: ResourceType
  timestamp: Date
  resourceStatus: ResourceStatus
  resourceStatusReason?: ResourceStatusReason
  resourceProperties?: ResourceProperties
  clientRequestToken: ClientRequestToken
}

export type ChangeSetId = string
export type ChangeSetName = string
export type ChangeSetStatusReason = string
export type ChangeSetStatus =
  | "CREATE_PENDING"
  | "CREATE_IN_PROGRESS"
  | "CREATE_COMPLETE"
  | "DELETE_COMPLETE"
  | "FAILED"

export type ResourceAttribute =
  | "Properties"
  | "Metadata"
  | "CreationPolicy"
  | "UpdatePolicy"
  | "DeletionPolicy"
  | "Tags"

export type ChangeSource =
  | "ResourceReference"
  | "ParameterReference"
  | "ResourceAttribute"
  | "DirectModification"
  | "Automatic"

export type CausingEntity = string
export type RequiresRecreation = "Never" | "Conditionally" | "Always"
export type PropertyName = string
export type EvaluationType = "Static" | "Dynamic"

export interface ResourceTargetDefinition {
  readonly attribute: ResourceAttribute
  readonly name: PropertyName
  readonly requiresRecreation: RequiresRecreation
}

export interface ResourceChangeDetail {
  readonly target?: ResourceTargetDefinition
  readonly evaluation: EvaluationType
  readonly changeSource: ChangeSource
  readonly causingEntity?: CausingEntity
}

export type ChangeType = "Resource"
export type ResourceChangeAction = "Add" | "Modify" | "Remove" | "Import"
export type ResourceChangeReplacement = "True" | "False" | "Conditional"

export interface ResourceChange {
  readonly action: ResourceChangeAction
  readonly logicalResourceId: LogicalResourceId
  readonly physicalResourceId?: PhysicalResourceId
  readonly resourceType: ResourceType
  readonly replacement: ResourceChangeReplacement
  readonly scope: ReadonlyArray<ResourceAttribute>
  readonly details: ReadonlyArray<ResourceChangeDetail>
}

export interface Change {
  readonly type: ChangeType
  readonly resourceChange: ResourceChange
}

export interface BaseChangeSet<P> {
  readonly id: ChangeSetId
  readonly name: ChangeSetName
  readonly stackId: StackId
  readonly status: ChangeSetStatus
  readonly statusReason: ChangeSetStatusReason
  readonly parameters: ReadonlyArray<P>
  readonly changes: ReadonlyArray<Change>
  readonly tags: ReadonlyArray<Tag>
}

export type ChangeSet = BaseChangeSet<StackParameter>

export type DetailedChangeSet = BaseChangeSet<DetailedStackParameter>
