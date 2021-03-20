import { Hook, HookInput, HookOutput } from "@takomo/stacks-model"
import { deepCopy } from "@takomo/util"
import { exec } from "child_process"
import { promisify } from "util"

const execP = promisify(exec)

/**
 * @hidden
 */
export class CmdHook implements Hook {
  readonly command: string
  readonly cwd?: string
  readonly exposeStackCredentials: boolean

  constructor(config: any) {
    if (!config.command) {
      throw new Error("command is required property")
    }

    this.command = config.command
    this.cwd = config.cwd
    this.exposeStackCredentials = config.exposeStackCredentials ?? false
  }

  async execute(input: HookInput): Promise<HookOutput> {
    const { ctx, status, operation, stage, logger, stack } = input
    try {
      const cwd = this.cwd ?? ctx.projectDir

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

      const { stdout } = await execP(this.command, { cwd, env })

      logger.infoText("Command output:", stdout)

      return {
        message: "Success",
        success: true,
        value: stdout.trim(),
      }
    } catch (e) {
      logger.infoText("Command output:", e.stdout)
      return {
        message: "Error",
        success: false,
        error: e,
      }
    }
  }
}
