import * as R from "ramda"
import { prepareAwsEnvVariables } from "../aws/util.js"
import { executeShellCommand } from "../utils/exec.js"
import { expandFilePath } from "../utils/files.js"
import { Hook, HookInput, HookOutput } from "./hook.js"

const safeEnvVariablePattern = /^[a-zA-Z_]+[a-zA-Z0-9_]*$/

type Capture = "last-line" | "all"

const captureValue = (capture: Capture, output: string): string => {
  switch (capture) {
    case "all":
      return output
    case "last-line":
      return R.last(output.split("\n")) ?? ""
    default:
      throw new Error(`Unknown value for capture: ${capture}`)
  }
}

export class CmdHook implements Hook {
  readonly command: string
  readonly cwd?: string
  readonly exposeStackCredentials: boolean
  readonly exposeStackRegion: boolean
  readonly capture: Capture

  constructor(config: any) {
    if (!config.command) {
      throw new Error("command is required property")
    }

    this.command = config.command
    this.cwd = config.cwd
    this.exposeStackCredentials = config.exposeStackCredentials ?? false
    this.exposeStackRegion = config.exposeStackRegion ?? false
    this.capture = config.capture ?? "all"

    if (this.capture !== "all" && this.capture !== "last-line") {
      throw new Error(`unsupported value for capture: ${this.capture}`)
    }
  }

  async execute(input: HookInput): Promise<HookOutput> {
    const { ctx, status, operation, stage, logger, stack, variables } = input
    try {
      const cwd = this.cwd
        ? expandFilePath(ctx.projectDir, this.cwd)
        : ctx.projectDir

      const hookValues = Object.entries(variables.hooks ?? {})
        .filter(([hookName]) => {
          if (!safeEnvVariablePattern.test(hookName)) {
            logger.warn(
              `Value of hook '${hookName}' could not be exposed in environment variables because the hook name contains unsafe characters`,
            )
            return false
          }

          return true
        })
        .reduce(
          (collected, [hookName, value]) => ({
            ...collected,
            [`TKM_HOOK_${hookName}`]: value,
          }),
          {},
        )

      const additionalVariables: Record<string, string> = status
        ? {
            ...hookValues,
            TKM_COMMAND_STAGE: stage,
            TKM_COMMAND_OPERATION: operation,
            TKM_COMMAND_STATUS: status,
          }
        : {
            ...hookValues,
            TKM_COMMAND_STAGE: stage,
            TKM_COMMAND_OPERATION: operation,
          }

      const credentials = this.exposeStackCredentials
        ? await stack.credentialManager.getCredentials()
        : undefined

      const region = this.exposeStackRegion ? stack.region : undefined

      const env = prepareAwsEnvVariables({
        env: process.env,
        credentials,
        region,
        additionalVariables,
      })

      const { stdout, success, error } = await executeShellCommand({
        cwd,
        env,
        command: this.command,
        stdoutListener: (data: string) => logger.info(data),
        stderrListener: (data: string) => logger.error(data),
      })

      if (success) {
        const value = captureValue(this.capture, stdout.trim())
        return {
          message: "Success",
          success: true,
          value,
        }
      }

      return {
        message: "Error",
        success: false,
        error,
      }
    } catch (error: any) {
      return {
        message: "Error",
        success: false,
        error,
      }
    }
  }
}
