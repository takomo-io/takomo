import { Hook, HookInput, HookOutput } from "@takomo/stacks-model"
import { deepCopy, executeShellCommand, expandFilePath } from "@takomo/util"
import R from "ramda"

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

/**
 * @hidden
 */
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
    const { ctx, status, operation, stage, logger, stack } = input
    try {
      const cwd = this.cwd
        ? expandFilePath(ctx.projectDir, this.cwd)
        : ctx.projectDir

      const env = {
        ...deepCopy(process.env),
        TKM_COMMAND_STAGE: stage,
        TKM_COMMAND_OPERATION: operation,
      }

      if (status) {
        env.TKM_COMMAND_STATUS = status
      }

      if (this.exposeStackCredentials) {
        const credentials = await stack.credentialManager.getCredentials()
        env.AWS_ACCESS_KEY_ID = credentials.accessKeyId
        env.AWS_SECRET_ACCESS_KEY = credentials.secretAccessKey
        env.AWS_SESSION_TOKEN = credentials.sessionToken
        env.AWS_SECURITY_TOKEN = credentials.sessionToken
      }

      if (this.exposeStackRegion) {
        env.AWS_DEFAULT_REGION = stack.region
      }

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
    } catch (error) {
      return {
        message: "Error",
        success: false,
        error,
      }
    }
  }
}
