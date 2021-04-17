import {
  Resolver,
  ResolverInput,
  ResolverProvider,
  ResolverProviderSchemaProps,
} from "@takomo/stacks-model"
import { deepCopy, deepFreeze } from "@takomo/util"
import { exec } from "child_process"
import { ObjectSchema } from "joi"
import { promisify } from "util"

const execP = promisify(exec)

export const init = async ({
  command,
  exposeStackCredentials,
  exposeStackRegion,
  cwd,
}: any): Promise<Resolver> => {
  if (!command) {
    throw new Error("command is required property")
  }

  return deepFreeze({
    resolve: async ({
      logger,
      parameterName,
      stack,
      ctx,
    }: ResolverInput): Promise<any> => {
      logger.debug(
        `Resolving value for parameter '${parameterName}' with command: ${command}`,
      )

      const env = deepCopy(process.env)

      if (exposeStackCredentials === true) {
        const credentials = await stack.credentialManager.getCredentials()
        env.AWS_ACCESS_KEY_ID = credentials.accessKeyId
        env.AWS_SECRET_ACCESS_KEY = credentials.secretAccessKey
        env.AWS_SESSION_TOKEN = credentials.sessionToken
        env.AWS_SECURITY_TOKEN = credentials.sessionToken
      }

      if (exposeStackRegion === true) {
        env.AWS_DEFAULT_REGION = stack.region
      }

      const { stdout } = await execP(command, {
        cwd: cwd ?? ctx.projectDir,
        env,
      })

      return (stdout ?? "").trim()
    },
  })
}

const name = "cmd"

const schema = ({ joi, base }: ResolverProviderSchemaProps): ObjectSchema =>
  base.keys({
    command: joi.string().required(),
    exposeStackCredentials: joi.boolean(),
    exposeStackRegion: joi.boolean(),
    cwd: joi.string(),
  })

export const createCmdResolverProvider = (): ResolverProvider =>
  deepFreeze({
    name,
    init,
    schema,
  })
