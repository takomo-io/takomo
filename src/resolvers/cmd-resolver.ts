import { ObjectSchema } from "joi"
import _ from "lodash"
import { prepareAwsEnvVariables } from "../aws/util.js"
import { executeShellCommand } from "../utils/exec.js"
import { expandFilePath } from "../utils/files.js"
import {
  REDACTED_VALUE,
  redactConfidentialValue,
} from "../utils/confidential.js"
import {
  ResolverProvider,
  ResolverConfig,
  ResolverProviderSchemaProps,
} from "./resolver-provider.js"
import { Resolver, ResolverInput } from "./resolver.js"

type Capture = "last-line" | "all"

const captureValue = (capture: Capture, output: string): string => {
  switch (capture) {
    case "all":
      return output
    case "last-line":
      return _.last(output.split("\n")) ?? ""
    default:
      throw new Error(`Unknown value for capture: ${capture}`)
  }
}

const init = async (config: ResolverConfig): Promise<Resolver> => {
  const { command, exposeStackCredentials, exposeStackRegion, cwd } = config
  const capture = config.capture ?? "all"

  if (typeof command !== "string" || command.length === 0) {
    throw new Error("command is required property")
  }

  if (capture !== "all" && capture !== "last-line") {
    throw new Error(`Unknown value for capture: ${String(capture)}`)
  }

  if (cwd !== undefined && typeof cwd !== "string") {
    throw new Error("cwd must be a string")
  }

  return {
    resolve: async ({
      logger,
      parameterName,
      stack,
      ctx,
      confidential = false,
    }: ResolverInput): Promise<string> => {
      const logConfidentialInfo = ctx.confidentialValuesLoggingEnabled
      logger.debug(
        `Resolving value for parameter '${parameterName}' with command: ${redactConfidentialValue(
          command,
          confidential,
          logConfidentialInfo,
        )}`,
      )

      const credentials =
        exposeStackCredentials === true
          ? await stack.credentialManager.getCredentials()
          : undefined

      const region = exposeStackRegion === true ? stack.region : undefined

      const env = prepareAwsEnvVariables({
        env: process.env,
        credentials,
        region,
      })

      const { stdout, success, error } = await executeShellCommand({
        command,
        env,
        cwd: cwd ? expandFilePath(ctx.projectDir, cwd) : ctx.projectDir,
        includeStderrInError: !confidential || logConfidentialInfo,
        stderrListener:
          !confidential || logConfidentialInfo
            ? (data: string) => logger.error(data)
            : undefined,
      })

      if (success) {
        return captureValue(capture, (stdout ?? "").trim())
      }

      throw error ?? new Error(REDACTED_VALUE)
    },
  }
}

const name = "cmd"

const schema = ({ joi, base }: ResolverProviderSchemaProps): ObjectSchema =>
  base.keys({
    command: joi.string().required(),
    exposeStackCredentials: joi.boolean(),
    exposeStackRegion: joi.boolean(),
    cwd: joi.string(),
    capture: joi.string().valid("all", "last-line"),
  })

export const createCmdResolverProvider = (): ResolverProvider => ({
  name,
  init,
  schema,
})
