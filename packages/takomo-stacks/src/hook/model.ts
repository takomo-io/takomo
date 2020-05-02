import { CommandContext } from "../context"
import { StackOperationVariables } from "../model"

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

/**
 * Hook configuration.
 */
export interface HookConfig {
  /**
   * Hook name
   */
  readonly name: string
  /**
   * Hook type
   */
  readonly type: string
  /**
   * Stage when the hook should be executed
   */
  readonly stage: HookStage[] | null
  /**
   * Operation during which the hook should be executed
   */
  readonly operation: HookOperation[] | null
  /**
   * Stack operation status after which the hook should be executed
   */
  readonly status: HookStatus[] | null
}

/**
 * Input for a life-cycle hook action.
 */
export interface HookInput {
  /**
   * Context object providing access to the current command.
   */
  readonly ctx: CommandContext

  /**
   * A mutable copy of the current command variables. Can be used to share data between hooks in of the same stack.
   */

  readonly variables: StackOperationVariables

  /**
   * Stack operation stage.
   */

  readonly stage: HookStage

  /**
   * Stack operation.
   */

  readonly operation: HookOperation

  /**
   * Status of the current stack operation. Has value only when the stage is "after".
   */

  readonly status: HookStatus | null
}

/**
 * Output of a life-cycle hook action.
 */
export interface HookOutput {
  /**
   * Message describing the outcome of the action.
   */
  readonly message: string

  /**
   * Boolean describing if the action was successful.
   */
  readonly success: boolean

  /**
   * Return value of the action.
   */
  readonly value: any | null
}

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
 * Wrapper that executes the hook.
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

  execute = async (input: HookInput): Promise<HookOutput> =>
    this.hook.execute(input)
}

export type HookInitializer = (props: any) => Promise<Hook>
export type HookInitializersMap = Map<HookType, HookInitializer>
