import { deepCopy } from "@takomo/util"
import { exec } from "child_process"
import { promisify } from "util"
import { Hook, HookConfig, HookInput, HookOutput } from "../model"

const execP = promisify(exec)

export class CmdHook implements Hook {
  readonly config: HookConfig
  readonly command: string
  readonly register: string | null
  readonly cwd: string | null

  constructor(config: any) {
    this.config = config

    if (!config.command) {
      throw new Error("command is required property")
    }

    this.command = config.command
    this.cwd = config.cwd || null
    this.register = config.register || null
  }

  async execute(input: HookInput): Promise<HookOutput> {
    try {
      const { ctx, variables, status, operation, stage } = input
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

      // TODO: Remove this option in Takomo 1.0.0 as the stdout is now exposed
      // using output value
      if (this.register) {
        // eslint-disable-next-line
        // @ts-ignore
        variables[this.register] = stdout.trim()
      }

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
