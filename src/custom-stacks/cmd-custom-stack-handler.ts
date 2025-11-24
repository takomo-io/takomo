import * as R from "ramda"
import { prepareAwsEnvVariables } from "../aws/util.js"
import { StacksContext } from "../context/stacks-context.js"
import { CustomStack } from "../stacks/custom-stack.js"
import { executeShellCommand } from "../utils/exec.js"
import { expandFilePath } from "../utils/files.js"
import { TkmLogger } from "../utils/logging.js"
import {
  CustomStackHandler,
  CustomStackState,
  Tags,
  Parameters,
} from "./custom-stack-handler.js"
import joi from "joi"
import { TakomoError } from "../utils/errors.js"

const commandStringSchema = joi.string().required()

const commandConfigSchema = joi
  .object({
    command: commandStringSchema,
    exposeStackCredentials: joi.boolean(),
    exposeStackRegion: joi.boolean(),
    cwd: joi.string(),
    capture: joi.string().valid("all", "last-line"),
  })
  .required()

const commandSchema = [commandConfigSchema, commandStringSchema]

const schema = joi.object({
  getCurrentStateCommand: commandSchema,
  createCommand: commandSchema,
  updateCommand: commandSchema,
  deleteCommand: commandSchema,
  exposeStackCredentials: joi.boolean(),
  exposeStackRegion: joi.boolean(),
  cwd: joi.string(),
  capture: joi.string().valid("all", "last-line"),
})

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

type CommandString = string

type CommandConfig = {
  readonly command: CommandString
  readonly exposeStackCredentials?: boolean
  readonly exposeStackRegion?: boolean
  readonly cwd?: string
  readonly capture?: Capture
}

type CmdCustomStackHandlerConfig = {
  readonly createCommand: CommandConfig | CommandString
  readonly updateCommand: CommandConfig | CommandString
  readonly deleteCommand: CommandConfig | CommandString
  readonly getCurrentStateCommand: CommandConfig | CommandString
  readonly cwd?: string
  readonly exposeStackCredentials?: boolean
  readonly exposeStackRegion?: boolean
  readonly capture?: Capture
}

type CmdCustomStackHandlerState = {} & CustomStackState

type ExecuteCommandProps = {
  config: CommandConfig
  handlerConfig: CmdCustomStackHandlerConfig
  stack: CustomStack
  ctx: StacksContext
  logger: TkmLogger
  parameters?: Parameters
  tags?: Tags
}

const toCommandConfig = (
  config: CommandConfig | CommandString,
): CommandConfig => {
  if (typeof config === "string") {
    return { command: config }
  }

  return config
}

const executeCommand = async ({
  config,
  handlerConfig,
  stack,
  ctx,
  logger,
  tags = {},
  parameters = {},
}: ExecuteCommandProps): Promise<string> => {
  const {
    command,
    exposeStackCredentials = handlerConfig.exposeStackCredentials,
    exposeStackRegion = handlerConfig.exposeStackRegion,
    cwd = handlerConfig.cwd,
    capture = handlerConfig.capture ?? "all",
  } = config

  const credentials =
    exposeStackCredentials === true
      ? await stack.credentialManager.getCredentials()
      : undefined

  const region = exposeStackRegion === true ? stack.region : undefined

  const additionalVariables: Record<string, string> = {}

  if (tags) {
    Object.entries(tags).forEach(([key, value]) => {
      const envVarName = `TKM_TAG_${key
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, "_")}`

      additionalVariables[envVarName] = value
    })

    additionalVariables["TKM_TAGS_JSON"] = JSON.stringify(tags)
  }

  if (parameters) {
    Object.entries(parameters).forEach(([key, value]) => {
      const envVarName = `TKM_PARAM_${key
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, "_")}`

      additionalVariables[envVarName] = value
    })

    additionalVariables["TKM_PARAMETERS_JSON"] = JSON.stringify(parameters)
  }

  const env = prepareAwsEnvVariables({
    env: process.env,
    credentials,
    region,
    additionalVariables,
  })

  const { stdout, success, error } = await executeShellCommand({
    command,
    env,
    cwd: cwd ? expandFilePath(ctx.projectDir, cwd) : ctx.projectDir,
    stdoutListener: (data: string) => logger.debug(data),
    stderrListener: (data: string) => logger.error(data),
  })

  if (!success) {
    throw error
  }

  const output = captureValue(capture, (stdout ?? "").trim())
  logger.debug(`Command output: ${output}`)

  return output
}

export const createCmdCustomStackHandler = (): CustomStackHandler<
  CmdCustomStackHandlerConfig,
  CmdCustomStackHandlerState
> => {
  return {
    type: "cmd",

    parseConfig: async (props) => {
      const { config, stackPath } = props
      const { error } = schema.validate(config, {
        abortEarly: false,
        convert: false,
      })

      if (error) {
        const details = error.details.map((d) => `  - ${d.message}`).join("\n")

        return {
          success: false,
          message: `Invalid custom stack configuration`,
          error: new TakomoError(
            `Validation errors in custom configuration of custom stack ${stackPath}:\n\n${details}`,
          ),
        }
      }

      return {
        success: true,
        config: config as CmdCustomStackHandlerConfig,
      }
    },

    getCurrentState: async (props) => {
      try {
        const output = await executeCommand({
          ...props,
          config: toCommandConfig(props.config.getCurrentStateCommand),
          handlerConfig: props.config,
        })

        try {
          return {
            success: true,
            state: JSON.parse(output) as CmdCustomStackHandlerState,
          }
        } catch (e) {
          const error = e as Error
          props.logger.error(
            `Get current state succeeded but parsing result failed for custom stack ${props.stack.path}`,
            error,
          )

          return {
            success: false,
            message: "Parsing get current state result failed",
            error,
          }
        }
      } catch (e) {
        const error = e as Error
        props.logger.error(
          `Getting current state failed for custom stack ${props.stack.path}`,
          error,
        )

        return {
          success: false,
          message: "Unhandled error",
          error,
        }
      }
    },

    create: async (props) => {
      try {
        const output = await executeCommand({
          ...props,
          config: toCommandConfig(props.config.createCommand),
          handlerConfig: props.config,
        })

        try {
          return {
            success: true,
            state: JSON.parse(output) as CmdCustomStackHandlerState,
          }
        } catch (e) {
          const error = e as Error
          props.logger.error(
            `Create succeeded but parsing result failed for custom stack ${props.stack.path}`,
            error,
          )

          return {
            success: false,
            message: "Parsing create result failed",
            error,
          }
        }
      } catch (e) {
        const error = e as Error
        props.logger.error(
          `Creating stack failed for custom stack ${props.stack.path}`,
          error,
        )

        return {
          success: false,
          message: "Unhandled error",
          error,
        }
      }
    },

    update: async (props) => {
      try {
        const output = await executeCommand({
          ...props,
          config: toCommandConfig(props.config.updateCommand),
          handlerConfig: props.config,
        })

        try {
          return {
            success: true,
            state: JSON.parse(output) as CmdCustomStackHandlerState,
          }
        } catch (e) {
          const error = e as Error
          props.logger.error(
            `Update succeeded but parsing result failed for custom stack ${props.stack.path}`,
            error,
          )

          return {
            success: false,
            message: "Parsing update result failed",
            error,
          }
        }
      } catch (e) {
        const error = e as Error
        props.logger.error(
          `Updating stack failed for custom stack ${props.stack.path}`,
          error,
        )

        return {
          success: false,
          message: "Unhandled error",
          error,
        }
      }
    },

    delete: async (props) => {
      try {
        await executeCommand({
          ...props,
          config: toCommandConfig(props.config.deleteCommand),
          handlerConfig: props.config,
        })

        // TODO: Validate state?

        return {
          success: true,
        }
      } catch (e) {
        const error = e as Error
        props.logger.error(
          `Getting current state failed for stack ${props.stack.path}`,
          error,
        )

        return {
          success: false,
          message: "Unhandled error",
          error,
        }
      }
    },
  }
}
