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
 * Represents the state of a custom stack. All but the `status` property are optional to allow
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
   *
   * Stack provides access for stack path, name, region, and AWS credentials.
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
export type SuccessfulGetCurrentStateResult<STATE extends CustomStackState> = {
  readonly success: true

  /**
   * The current state of the custom stack. This property is optional to allow
   * flexibility for different custom stack implementations. An undefined value
   * indicates that the stack does not exist.
   */
  readonly currentState?: STATE
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
   *
   * Stack provides access for stack path, name, region, and AWS credentials.
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
    readonly createdState: STATE
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
  readonly currentState: STATE

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
   *
   * Stack provides access for stack path, name, region, and AWS credentials.
   */
  readonly stack: CustomStack

  /**
   * The stacks context.
   */
  readonly ctx: StacksContext
}

/**
 * Represents a successful result of updating a custom stack.
 *
 * Contains the updated state of the custom stack after the operation completes successfully.
 */
export type SuccessfulUpdateCustomStackResult<STATE extends CustomStackState> =
  {
    readonly success: true
    /**
     * The updated state of the custom stack after the update operation.
     * This reflects the new state of the stack with all changes applied.
     */
    readonly updatedState: STATE
  }

/**
 * Represents a failed result of updating a custom stack.
 *
 * Provides information about why the update operation failed, including
 * optional error details and descriptive messages for troubleshooting.
 */
export type FailedUpdateCustomStackResult = {
  readonly success: false
  /**
   * An optional error object containing detailed information about the failure.
   */
  readonly error?: Error

  /**
   * An optional human-readable message providing additional context about the failure.
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
  readonly rawConfig: unknown

  /**
   * The stack path of the custom stack.
   */
  readonly stackPath: StackPath
}

/**
 * Represents a successful result of parsing a custom stack configuration.
 *
 * Contains the validated and parsed configuration object that can be safely
 * used in subsequent custom stack operations such as create, update and delete.
 */
export type SuccessfulParseConfigResult<CONFIG> = {
  readonly success: true
  /**
   * The successfully parsed and validated configuration object.
   * This configuration will be used for all subsequent stack operations.
   */
  readonly parsedConfig: CONFIG
}

/**
 * Represents a failed result of parsing a custom stack configuration.
 *
 * Provides detailed information about validation or parsing failures,
 * helping users understand what went wrong with their configuration.
 */
export type FailedParseConfigResult = {
  readonly success: false

  /**
   * An optional error object containing detailed information about the parsing failure.
   * This may include validation errors, schema mismatches, or other configuration issues.
   */
  readonly error?: Error

  /**
   * An optional human-readable message describing why the configuration parsing failed.
   * This should provide actionable information to help users fix their configuration.
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
  readonly currentState: STATE

  /**
   * The configuration object for the custom stack.
   */
  readonly config: CONFIG

  /**
   * The custom stack to be deleted.
   *
   * Stack provides access for stack path, name, region, and AWS credentials.
   */
  readonly stack: CustomStack

  /**
   * The stacks context.
   */
  readonly ctx: StacksContext
}

/**
 * Represents a successful result of deleting a custom stack.
 *
 * Indicates that the custom stack has been successfully removed and
 * all associated resources have been cleaned up properly.
 */
export type SuccessFullDeleteCustomStackResult = {
  readonly success: true
}

/**
 * Represents a failed result of deleting a custom stack.
 *
 * Provides information about why the deletion operation failed,
 * which can help with troubleshooting and retry strategies.
 */
export type FailedDeleteCustomStackResult = {
  readonly success: false
  /**
   * An optional human-readable message describing why the deletion failed.
   * This can provide context about partial deletions, dependency issues, or other problems.
   */
  readonly message?: string
  /**
   * An optional error object containing detailed information about the deletion failure.
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
  readonly currentState: STATE

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
   *
   * Stack provides access for stack path, name, region, and AWS credentials.
   */
  readonly stack: CustomStack

  /**
   * The stacks context.
   */
  readonly ctx: StacksContext
}

/**
 * Represents a change detected in a custom stack.
 *
 * This type is used to describe individual modifications that would be made
 * to a custom stack during an update operation. The description should be
 * human-readable and provide enough detail for users to understand the impact.
 */
export type CustomStackChange = {
  /**
   * A human-readable description of the change.
   * This should clearly explain what will be modified, added, or removed
   * in a way that helps users understand the impact of the change.
   */
  readonly description: string
}

/**
 * Represents a successful result of detecting changes in a custom stack.
 *
 * Contains an optional list of changes that would be applied to the stack.
 * An empty or undefined changes array indicates no modifications are needed.
 */
export type SuccessfulGetChangesResult = {
  success: true

  /**
   * An optional list of changes that would be applied to the custom stack.
   * If undefined or empty, it indicates that no changes are required.
   * Each change describes a specific modification that would be made.
   */
  changes?: ReadonlyArray<CustomStackChange>
}

/**
 * Represents a failed result of detecting changes in a custom stack.
 *
 * Indicates that the change detection process encountered an error
 * and could not determine what modifications would be required.
 */
export type FailedGetChangesResult = {
  success: false
  /**
   * An optional human-readable message describing why change detection failed.
   * This can help users understand what went wrong and how to resolve the issue.
   */
  message?: string
  /**
   * An optional error object containing detailed information about the failure.
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
 * Interface for handling custom stack operations in Takomo.
 *
 * A custom stack handler provides the core functionality for managing custom stacks
 * throughout their lifecycle, including creation, updates, deletion, and state management.
 * Custom stack handlers enable extending Takomo's capabilities beyond standard CloudFormation
 * stacks to support other infrastructure provisioning tools or custom deployment logic.
 *
 * @template CONFIG - The configuration type for this custom stack handler
 * @template STATE - The state type that extends CustomStackState, representing the current state of the stack
 */
export interface CustomStackHandler<CONFIG, STATE extends CustomStackState> {
  /**
   * The type identifier for this custom stack handler.
   *
   * This unique identifier is used to match custom stack configurations
   * with their corresponding handler implementation. It should be a
   * descriptive string that clearly identifies the type of infrastructure
   * or deployment tool this handler manages.
   */
  readonly type: CustomStackType

  /**
   * Retrieves the current state of the custom stack from the target environment.
   *
   * This function is crucial for determining the stack's lifecycle operations:
   * - During deployment: determines whether to create a new stack or update an existing one
   * - During undeployment: determines whether a stack exists and needs to be deleted
   *
   * The implementation should query the actual infrastructure to determine the
   * real state, not just return cached or assumed values.
   *
   * Implementing this function is optional; if not provided, the stack will be assumed to be in a "UNKNOWN" state.
   * - During deployment; stacks with "UNKNOWN" state are assumed to require creation (i.e. create function is always invoked).
   * - During undeployment; stacks with "UNKNOWN" state are assumed to require deletion (i.e. delete function is always invoked).
   *
   * @param props - Configuration and context needed to query the stack state
   * @returns A promise resolving to the current state or an error result
   */
  readonly getCurrentState?: (
    props: GetCurrentStateProps<CONFIG>,
  ) => Promise<GetCurrentStateResult<STATE>>

  /**
   * Analyzes and returns the changes that would be applied to bring the stack
   * from its current state to the desired state defined by the configuration.
   *
   * This function is invoked during deployment of existing stacks to:
   * - Show users what changes will be made before applying them
   * - Determine if any changes are actually required
   * - Enable dry-run functionality for planning purposes
   *
   * The implementation should compare the current stack state with the desired
   * configuration and return a detailed list of changes that would be applied.
   * The format and granularity of changes is up to the implementation.
   *
   * Implementing this function is optional; if not provided, Takomo will assume that
   * changes are always present but no detailed change information is available.
   *
   * @param props - Current state, desired configuration, and context for comparison
   * @returns A promise resolving to the detected changes or an error result
   */
  readonly getChanges?: (
    props: GetChangesProps<CONFIG, STATE>,
  ) => Promise<GetChangesResult>

  /**
   * Validates and parses the raw configuration for this custom stack type.
   *
   * This function is responsible for:
   * - Validating the configuration against the expected schema
   * - Converting raw configuration data into a typed configuration object
   * - Providing meaningful error messages for invalid configurations
   * - Applying default values where appropriate
   *
   * The parsed configuration object will be passed to all subsequent operations,
   * such as create, update, and delete.
   *
   * @param props - Raw configuration data and parsing context
   * @returns A promise resolving to the parsed configuration or validation errors
   */
  readonly parseConfig: (
    props: ParseConfigProps,
  ) => Promise<ParseConfigResult<CONFIG>>

  /**
   * Creates a new instance of the custom stack in the target environment.
   *
   * This function should:
   * - Provision all necessary infrastructure resources
   * - Apply the specified parameters and tags
   * - Return the final state of the created stack
   *
   * The implementation should ensure idempotency where possible and provide
   * detailed error information if the creation fails.
   *
   * @param props - Configuration, parameters, tags, and context for creation
   * @returns A promise resolving to the created stack state or an error result
   */
  readonly create: (
    props: CreateCustomStackProps<CONFIG>,
  ) => Promise<CreateCustomStackResult<STATE>>

  /**
   * Updates an existing custom stack to match the desired configuration.
   *
   * This function should:
   * - Apply configuration changes to the existing stack
   * - Update parameters and tags as specified
   * - Handle resource modifications, additions, and removals
   * - Return the updated state of the stack
   *
   * The implementation should handle update conflicts gracefully and provide
   * detailed information about what changes were actually applied.
   *
   * @param props - Current state, desired configuration, and context for update
   * @returns A promise resolving to the updated stack state or an error result
   */
  readonly update: (
    props: UpdateCustomStackProps<CONFIG, STATE>,
  ) => Promise<UpdateCustomStackResult<STATE>>

  /**
   * Removes the custom stack and all its associated resources from the target environment.
   *
   * This function should:
   * - Clean up all resources created by the stack
   * - Ensure complete removal without leaving orphaned resources
   * - Handle cases where some resources have already been deleted
   *
   * The implementation should be as thorough as possible in cleanup while
   * being resilient to partial failures and resource dependencies.
   *
   * @param props - Current state, configuration, and context for deletion
   * @returns A promise resolving to success or detailed error information
   */
  readonly delete: (
    props: DeleteCustomStackProps<CONFIG, STATE>,
  ) => Promise<DeleteCustomStackResult>
}
