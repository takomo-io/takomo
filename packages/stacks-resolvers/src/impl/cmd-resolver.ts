import Joi from "@hapi/joi"
import { Resolver, ResolverInput, ResolverProvider } from "@takomo/stacks-model"
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

export class CmdResolverProvider implements ResolverProvider {
  readonly name = "cmd"

  init = async (props: any) => new CmdResolver(props)

  schema = (joi: Joi.Root, base: Joi.ObjectSchema): Joi.ObjectSchema =>
    base.keys({
      command: joi.string().required(),
    })
}
