import { Hook, HookConfig, HookInput, HookOutput } from "@takomo/stacks-model"
import { deepCopy } from "@takomo/util"
import { exec } from "child_process"
import { promisify } from "util"

const execP = promisify(exec)

export class CmdHook implements Hook {
  readonly config: HookConfig
  readonly command: string
  readonly cwd: string | null

  constructor(config: any) {
    this.config = config

    if (!config.command) {
      throw new Error("command is required property")
    }

    this.command = config.command
    this.cwd = config.cwd || null
  }

  async execute(input: HookInput): Promise<HookOutput> {
    try {
      const { ctx, status, operation, stage } = input
      const cwd = this.cwd || ctx.getOptions().getProjectDir()
      const env = {
        ...deepCopy(process.env),
        TKM_COMMAND_STAGE: stage,
        TKM_COMMAND_OPERATION: operation,
      }

      if (status) {
        env.TKM_COMMAND_STATUS = status
      }

      const { stdout } = await execP(this.command, { cwd, env })

      console.log(stdout)

      return {
        message: "Success",
        success: true,
        value: stdout.trim(),
      }
    } catch (e) {
      return {
        message: e.message,
        success: false,
        value: null,
      }
    }
  }
}
