import { CloudFormationStack } from "../aws/cloudformation/model.js"
import { StacksContext } from "../context/stacks-context.js"
import { StandardStack } from "../stacks/standard-stack.js"
import { StackOperationVariables } from "../takomo-stacks-context/model.js"
import { TkmLogger } from "../utils/logging.js"

export type HookType = string
export type HookName = string

/**
 * Specifies during which stack operation the hook should be executed.
 */
export type HookOperation = "create" | "update" | "delete"

/**
 * Specifies during which stack operation stage stage the hook should be executed.
 */
export type HookStage = "before" | "after"

/**
 * Specifies after which stack operation status the hook should be executed.
 */
export type HookStatus = "success" | "failed" | "skipped" | "cancelled"

export type HookOutput = HookOutputObject | Error | boolean

export type HookExecutionResult = "continue" | "abort" | "skip"

export interface HooksExecutionOutput {
  /**
   * Message describing the outcome of the action.
   */
  readonly message: string

  /**
   * Hook execution result.
   */
  readonly result: HookExecutionResult

  /**
   * If an error was thrown during execution it will be stored here.
   */
  readonly error?: Error
}

/**
 * Input for a life-cycle hook action.
 */
export interface HookInput {
  readonly ctx: StacksContext
  readonly stack: StandardStack
  readonly variables: StackOperationVariables
  readonly stage: HookStage
  readonly operation: HookOperation
  readonly currentStack?: CloudFormationStack
  readonly status?: HookStatus
  readonly logger: TkmLogger
}

/**
 * Output of a life-cycle hook action.
 */
export interface HookOutputObject {
  /**
   * Optional message describing the outcome of the action.
   */
  readonly message?: string

  /**
   * Boolean describing if the action was successful.
   */
  readonly success: boolean

  /**
   * Optional return value.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly value?: any

  /**
   * Optional error.
   */
  readonly error?: Error

  /**
   * Optional boolean that can be returned from hooks executed
   * before the stack operation to indicate that the operation
   * should be skipped and all the remaining before hooks should
   * be ignored.
   */
  readonly skip?: boolean
}

/**
 * Life-cycle hook used to perform actions at different stages of stack deploy and undeploy commands.
 */
export interface Hook {
  /**
   * Perform the hook action.
   *
   * @param input Inputs for the action
   * @returns Action output
   */
  execute: (input: HookInput) => Promise<HookOutput>
}

export interface HookConfig {
  readonly name: HookName
  readonly type: HookType
  readonly stage?: ReadonlyArray<HookStage>
  readonly operation?: ReadonlyArray<HookOperation>
  readonly status?: ReadonlyArray<HookStatus>
  [property: string]: unknown
}
