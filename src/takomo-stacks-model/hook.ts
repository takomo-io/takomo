import { TkmLogger } from "../takomo-util"
import { StackOperationVariables } from "./command"
import { StacksContext } from "./context"
import { Stack } from "./stack"

export type HookType = string

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

/**
 * @hidden
 */
export type HookExecutionResult = "continue" | "abort" | "skip"

/**
 * @hidden
 */
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
  readonly stack: Stack
  readonly variables: StackOperationVariables
  readonly stage: HookStage
  readonly operation: HookOperation
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

/**
 * @hidden
 */
export class HookExecutor implements Hook {
  readonly config: HookConfig
  private readonly hook: Hook

  /**
   * @param config Hook configuration
   * @param hook Hook instance
   */
  constructor(config: HookConfig, hook: Hook) {
    this.config = config
    this.hook = hook
  }

  /**
   * @param input Hook input
   * @returns Should the hook be executed
   */
  match = (input: HookInput): boolean => {
    if (this.config.stage && !this.config.stage.includes(input.stage)) {
      return false
    }
    if (
      this.config.operation &&
      !this.config.operation.includes(input.operation)
    ) {
      return false
    }
    return !(
      input.status &&
      this.config.status &&
      !this.config.status.includes(input.status)
    )
  }

  execute = async (input: HookInput): Promise<HookOutputObject> => {
    try {
      const result = await this.hook.execute(input)
      if (typeof result === "boolean") {
        return {
          message: result ? "Success" : "Failed",
          success: result,
          value: result,
        }
      }

      if (result instanceof Error) {
        return {
          message: result.message || "Error",
          success: false,
          value: result,
        }
      }

      return result
    } catch (e: any) {
      return {
        message: e.message ?? "Error",
        success: false,
      }
    }
  }
}

/**
 * @hidden
 */
export interface HookConfig {
  readonly name: string
  readonly type: string
  readonly stage?: ReadonlyArray<HookStage>
  readonly operation?: ReadonlyArray<HookOperation>
  readonly status?: ReadonlyArray<HookStatus>
}

/**
 * An interface to be implemented by objects that initialize {@linkcode Hook}
 * objects.
 */
export interface HookProvider {
  /**
   * The name of the hook that this provider initializes.
   */
  readonly type: HookType

  /**
   * Initialize a hook.
   */
  readonly init: (props: any) => Promise<Hook>
}
