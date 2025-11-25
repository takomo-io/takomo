import { StacksContext } from "../index.js"
import { CustomStack, CustomStackStatus } from "../stacks/custom-stack.js"
import { CustomStackType, StackPath } from "../stacks/stack.js"
import { TkmLogger } from "../utils/logging.js"

export type ParameterName = string
export type ParameterValue = string
export type Parameters = Record<ParameterName, ParameterValue>

export type TagName = string
export type TagValue = string
export type Tags = Record<TagName, TagValue>

export type OutputName = string
export type OutputValue = string
export type Outputs = Record<OutputName, OutputValue>

/**
 * Represents the state of a custom stack. All properties are optional to allow
 * flexibility for different custom stack implementations.
 */
export type CustomStackState = {
  /**
   * The status of the custom stack. This property is mandatory and is
   * used to represent the current status of the custom stack.
   */
  status: CustomStackStatus

  /**
   * Optional property representing the last updated time of the custom stack.
   */
  lastUpdatedTime?: Date

  /**
   * Optional property representing the creation time of the custom stack.
   */
  creationTime?: Date

  /**
   * Optional property representing the parameters of the custom stack.
   */
  parameters?: Parameters

  /**
   * Optional property representing the tags of the custom stack.
   */
  tags?: Tags

  /**
   * Optional property representing the outputs of the custom stack.
   */
  outputs?: Outputs
}

/**
 * Represents the properties passed to get the current state of a custom stack.
 */
export type GetCurrentStateProps<CONFIG> = {
  /**
   * The logger instance to be used for logging.
   */
  readonly logger: TkmLogger

  /**
   * The configuration object for the custom stack.
   */
  readonly config: CONFIG

  /**
   * The custom stack for which the current state is being retrieved.
   */
  readonly stack: CustomStack

  /**
   * The stacks context.
   */
  readonly ctx: StacksContext
}

/**
 * Represents a successful result of getting the current state of a custom stack.
 */
export type SuccessfulGetCurrentStateResult<CONFIG> = {
  readonly success: true

  /**
   * The current state of the custom stack.
   */
  readonly state: CONFIG
}

/**
 * Represents a failed result of getting the current state of a custom stack.
 */
export type FailedGetCurrentStateResult = {
  readonly success: false

  /**
   * An optional error object if the operation failed.
   */
  readonly error?: Error

  /**
   * An optional message providing additional information about the operation result.
   */
  readonly message?: string
}

/**
 * Represents the result of getting the current state of a custom stack.
 */
export type GetCurrentStateResult<STATE extends CustomStackState> =
  | SuccessfulGetCurrentStateResult<STATE>
  | FailedGetCurrentStateResult

/**
 * Represents the properties passed to create a custom stack operation.
 */
export type CreateCustomStackProps<CONFIG> = {
  /**
   * The logger instance to be used for logging.
   */
  readonly logger: TkmLogger

  /**
   * The configuration object for the custom stack.
   */
  readonly config: CONFIG

  /**
   * The parameters to be used for the create operation.
   */
  readonly parameters: Parameters

  /**
   * The tags to be used for the create operation.
   */
  readonly tags: Tags

  /**
   * The custom stack to be created.
   */
  readonly stack: CustomStack

  /**
   * The stacks context.
   */
  readonly ctx: StacksContext
}

/**
 * Represents a successful result of creating a custom stack.
 */
export type SuccessfulCreateCustomStackResult<STATE extends CustomStackState> =
  {
    readonly success: true

    /**
     * The state of the custom stack after creation.
     */
    readonly state: STATE
  }

/**
 * Represents a failed result of creating a custom stack.
 */
export type FailedCreateCustomStackResult = {
  readonly success: false

  /**
   * An optional error object if the operation failed.
   */
  readonly error?: Error

  /**
   * An optional message providing additional information about the operation result.
   */
  readonly message?: string
}

/**
 * Represents the result of creating a custom stack.
 */
export type CreateCustomStackResult<STATE extends CustomStackState> =
  | SuccessfulCreateCustomStackResult<STATE>
  | FailedCreateCustomStackResult

/**
 * Represents the properties passed to update a custom stack operation.
 */
export type UpdateCustomStackProps<CONFIG, STATE extends CustomStackState> = {
  /**
   * The logger instance to be used for logging.
   */
  readonly logger: TkmLogger

  /**
   * The current state of the custom stack.
   */
  readonly state: STATE

  /**
   * The configuration object for the custom stack.
   */
  readonly config: CONFIG

  /**
   * The parameters to be used for the update operation.
   */
  readonly parameters: Parameters

  /**
   * The tags to be used for the update operation.
   */
  readonly tags: Tags

  /**
   * The custom stack to be updated.
   */
  readonly stack: CustomStack

  /**
   * The stacks context.
   */
  readonly ctx: StacksContext
}

export type SuccessfulUpdateCustomStackResult<STATE extends CustomStackState> =
  {
    readonly success: true
    /**
     * The updated state of the custom stack.
     */
    readonly state: STATE
  }

export type FailedUpdateCustomStackResult = {
  readonly success: false
  /**
   * An optional error object if the operation failed.
   */
  readonly error?: Error

  /**
   * An optional message providing additional information about the operation result.
   */
  readonly message?: string
}

/**
 * Represents the result of updating a custom stack.
 */
export type UpdateCustomStackResult<STATE extends CustomStackState> =
  | SuccessfulUpdateCustomStackResult<STATE>
  | FailedUpdateCustomStackResult

/**
 * Represents the properties passed to parse a custom stack configuration function.
 */
export type ParseConfigProps = {
  /**
   * The logger instance to be used for logging.
   */
  readonly logger: TkmLogger

  /**
   * The raw configuration object to be parsed.
   */
  readonly config: unknown

  /**
   * The stack path of the custom stack.
   */
  readonly stackPath: StackPath
}

/**
 * Represents a successful result of parsing a custom stack configuration.
 */
export type SuccessfulParseConfigResult<CONFIG> = {
  readonly success: true
  readonly config: CONFIG
}

/**
 * Represents a failed result of parsing a custom stack configuration.
 */
export type FailedParseConfigResult = {
  readonly success: false

  /**
   * An optional error object if the parsing failed.
   */
  readonly error?: Error

  /**
   * An optional message providing additional information about the parsing result.
   */
  readonly message?: string
}

/**
 * Represents the result of parsing a custom stack configuration.
 */
export type ParseConfigResult<CONFIG> =
  | SuccessfulParseConfigResult<CONFIG>
  | FailedParseConfigResult

/**
 * Represents the properties passed to delete a custom stack operation.
 */
export type DeleteCustomStackProps<CONFIG, STATE extends CustomStackState> = {
  /**
   * The logger instance to be used for logging.
   */
  readonly logger: TkmLogger

  /**
   * The current state of the custom stack.
   */
  readonly state: STATE

  /**
   * The configuration object for the custom stack.
   */
  readonly config: CONFIG

  /**
   * The custom stack to be deleted.
   */
  readonly stack: CustomStack

  /**
   * The stacks context.
   */
  readonly ctx: StacksContext
}

/**
 * Represents a successful result of deleting a custom stack.
 */
export type SuccessFullDeleteCustomStackResult = {
  readonly success: true
}

/**
 * Represents a failed result of deleting a custom stack.
 */
export type FailedDeleteCustomStackResult = {
  readonly success: false
  /**
   * An optional message providing additional information about the operation result.
   */
  readonly message?: string
  /**
   * An optional error object if the operation failed.
   */
  readonly error?: Error
}

/**
 * Represents the result of deleting a custom stack.
 */
export type DeleteCustomStackResult =
  | SuccessFullDeleteCustomStackResult
  | FailedDeleteCustomStackResult

/**
 * Represents the properties passed to get changes of a custom stack operation.
 */
export type GetChangesProps<CONFIG, STATE extends CustomStackState> = {
  /**
   * The logger instance to be used for logging.
   */
  readonly logger: TkmLogger

  /**
   * The current state of the custom stack.
   */
  readonly state: STATE

  /**
   * The configuration object for the custom stack.
   */
  readonly config: CONFIG

  /**
   * The parameters to be used for the update operation.
   */
  readonly parameters: Parameters

  /**
   * The tags to be used for the update operation.
   */
  readonly tags: Tags

  /**
   * The custom stack to be updated.
   */
  readonly stack: CustomStack

  /**
   * The stacks context.
   */
  readonly ctx: StacksContext
}

/**
 * Represents a change in a custom stack.
 */
export type CustomStackChange = {
  readonly description: string
}

/**
 * Represents a successful result of getting changes of a custom stack.
 */
export type SuccessfulGetChangesResult = {
  success: true

  /**
   * The list of changes detected in the custom stack.
   */
  changes?: ReadonlyArray<CustomStackChange>
}

/**
 * Represents a failed result of getting changes of a custom stack.
 */
export type FailedGetChangesResult = {
  success: false
  /**
   * An optional message providing additional information about the operation result.
   */
  message?: string
  /**
   * An optional error object if the operation failed.
   */
  error?: Error
}

/**
 * Represents the result of getting changes of a custom stack.
 */
export type GetChangesResult =
  | SuccessfulGetChangesResult
  | FailedGetChangesResult

/**
 * Interface defining the contract for handling custom stack operations.
 */
export interface CustomStackHandler<CONFIG, STATE extends CustomStackState> {
  /**
   * The type of the custom stack this handler manages.
   */
  readonly type: CustomStackType

  /**
   * Gets the current state of the custom stack.
   *
   * During deploy operation, the existence of the stack determines whether to create
   * or update the stack. During undeploy operation, the existence of the stack determines
   * whether to attempt deletion or skip it.
   */
  readonly getCurrentState: (
    props: GetCurrentStateProps<CONFIG>,
  ) => Promise<GetCurrentStateResult<STATE>>

  /**
   * Gets the changes between the current state and the desired state of the custom stack.
   * Invoked during deploy of an existing stack to determine whether there would be any changes in the stack.
   */
  readonly getChanges: (
    props: GetChangesProps<CONFIG, STATE>,
  ) => Promise<GetChangesResult>

  /**
   * Parses the custom stack configuration.
   */
  readonly parseConfig: (
    props: ParseConfigProps,
  ) => Promise<ParseConfigResult<CONFIG>>

  /**
   * Creates a new custom stack.
   */
  readonly create: (
    props: CreateCustomStackProps<CONFIG>,
  ) => Promise<CreateCustomStackResult<STATE>>

  /**
   * Updates an existing custom stack.
   */
  readonly update: (
    props: UpdateCustomStackProps<CONFIG, STATE>,
  ) => Promise<UpdateCustomStackResult<STATE>>

  /**
   * Deletes an existing custom stack.
   */
  readonly delete: (
    props: DeleteCustomStackProps<CONFIG, STATE>,
  ) => Promise<DeleteCustomStackResult>
}
