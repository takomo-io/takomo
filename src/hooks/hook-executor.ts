import { Hook, HookConfig, HookInput, HookOutputObject } from "./hook.js"
import { getErrorMessage } from "../utils/errors.js"

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
          message: result.message ?? "Error",
          success: false,
          value: result,
        }
      }

      return result
    } catch (e: unknown) {
      return {
        message: getErrorMessage(e),
        success: false,
      }
    }
  }
}
