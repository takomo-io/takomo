import { StackOperationVariables } from "./command"
import { StacksContext } from "./context"

export type HookInitializer = (props: any) => Promise<Hook>

/**
 * @hidden
 */
export type HookInitializersMap = Map<HookType, HookInitializer>

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
export interface HooksExecutionOutput {
  /**
   * Message describing the outcome of the action.
   */
  readonly message: string

  /**
   * Boolean describing if the action was successful.
   */
  readonly success: boolean
}

/**
 * Life-cycle hook used to perform actions at different stages of stack deploy and uneploy commands.
 */
export interface Hook {
  /**
   * Perform the hook action.
   *
   * @param input Inputs for the action
   * @returns Action output
   */
  execute(input: HookInput): Promise<HookOutput>
}

/**
 * Input for a life-cycle hook action.
 */
export interface HookInput {
  readonly ctx: StacksContext
  readonly variables: StackOperationVariables
  readonly stage: HookStage
  readonly operation: HookOperation
  readonly status?: HookStatus
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
}

/**
 * Life-cycle hook used to perform actions at different stages of stack deploy and uneploy commands.
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
    } catch (e) {
      return {
        message: e.message || "Error",
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
  readonly stage: ReadonlyArray<HookStage> | null
  readonly operation: ReadonlyArray<HookOperation> | null
  readonly status: ReadonlyArray<HookStatus> | null
}
