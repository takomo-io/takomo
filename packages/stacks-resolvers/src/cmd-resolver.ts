import {
  Resolver,
  ResolverInput,
  ResolverProvider,
  ResolverProviderSchemaProps,
} from "@takomo/stacks-model"
import { deepFreeze } from "@takomo/util"
import { exec } from "child_process"
import { ObjectSchema } from "joi"
import { promisify } from "util"

const execP = promisify(exec)

export const init = async ({ command }: any): Promise<Resolver> => {
  if (!command) {
    throw new Error("command is required property")
  }

  return deepFreeze({
    resolve: async ({ logger, parameterName }: ResolverInput): Promise<any> => {
      logger.debug(
        `Resolving value for parameter '${parameterName}' with command: ${command}`,
      )
      const { stdout } = await execP(command)
      return (stdout || "").trim()
    },
  })
}

const name = "cmd"

const schema = ({ joi, base }: ResolverProviderSchemaProps): ObjectSchema =>
  base.keys({
    command: joi.string().required(),
  })

export const createCmdResolverProvider = (): ResolverProvider =>
  deepFreeze({
    name,
    init,
    schema,
  })
