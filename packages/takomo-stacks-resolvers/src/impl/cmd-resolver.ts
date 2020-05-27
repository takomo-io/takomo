import { Resolver, ResolverInput } from "@takomo/stacks-model"
import { exec } from "child_process"
import { promisify } from "util"

const execP = promisify(exec)

export class CmdResolver implements Resolver {
  private readonly command: string

  constructor(props: any) {
    if (!props.command) {
      throw new Error("command is required property")
    }

    this.command = props.command
  }

  resolve = async ({ logger, parameterName }: ResolverInput): Promise<any> => {
    logger.debug(
      `Resolving value for parameter '${parameterName}' with command: ${this.command}`,
    )
    const { stdout, stderr } = await execP(this.command)
    return (stdout || "").trim()
  }
}
