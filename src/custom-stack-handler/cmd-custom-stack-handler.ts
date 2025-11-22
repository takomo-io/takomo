import * as R from "ramda"
import { prepareAwsEnvVariables } from "../aws/util.js"
import { StacksContext } from "../context/stacks-context.js"
import { CustomStack } from "../stacks/custom-stack.js"
import { executeShellCommand } from "../utils/exec.js"
import { expandFilePath } from "../utils/files.js"
import { TkmLogger } from "../utils/logging.js"
import { CustomStackHandler, CustomStackState } from "./custom-stack-handler.js"
import joi from "joi"
import { TakomoError } from "../utils/errors.js"

const commandConfigSchema = joi.object({
  command: joi.string().required(),
  exposeStackCredentials: joi.boolean(),
  exposeStackRegion: joi.boolean(),
  cwd: joi.string(),
  capture: joi.string().valid("all", "last-line"),
})

const schema = commandConfigSchema.keys({
  getCurrentStateCommand: commandConfigSchema.required(),
  createCommand: commandConfigSchema.required(),
  updateCommand: commandConfigSchema.required(),
  deleteCommand: commandConfigSchema.required(),
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

type CommandConfig = {
  readonly command: string
  readonly exposeStackCredentials?: boolean
  readonly exposeStackRegion?: boolean
  readonly cwd?: string
  readonly capture?: Capture
}

type CmdCustomStackHandlerConfig = {
  readonly createCommand: CommandConfig
  readonly updateCommand: CommandConfig
  readonly deleteCommand: CommandConfig
  readonly getCurrentStateCommand: CommandConfig
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
}

const executeCommand = async <T>({
  config,
  handlerConfig,
  stack,
  ctx,
  logger,
}: ExecuteCommandProps): Promise<T> => {
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

  const env = prepareAwsEnvVariables({
    env: process.env,
    credentials,
    region,
  })

  const { stdout, success, error } = await executeShellCommand({
    command,
    env,
    cwd: cwd ? expandFilePath(ctx.projectDir, cwd) : ctx.projectDir,
    stdoutListener: (data: string) => logger.info(data),
    stderrListener: (data: string) => logger.error(data),
  })

  if (!success) {
    throw error
  }

  const output = captureValue(capture, (stdout ?? "").trim())
  logger.debug(`Command output: ${output}`)

  return JSON.parse(output) as T
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
        const state: CmdCustomStackHandlerState = await executeCommand({
          ...props,
          config: props.config.getCurrentStateCommand,
          handlerConfig: props.config,
        })

        // TODO: Validate state?

        return {
          success: true,
          state,
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
        const state: CmdCustomStackHandlerState = await executeCommand({
          ...props,
          config: props.config.createCommand,
          handlerConfig: props.config,
        })

        // TODO: Validate state?

        return {
          success: true,
          state,
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
        const state: CmdCustomStackHandlerState = await executeCommand({
          ...props,
          config: props.config.updateCommand,
          handlerConfig: props.config,
        })

        // TODO: Validate state?

        return {
          success: true,
          state,
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
        const state: CmdCustomStackHandlerState = await executeCommand({
          ...props,
          config: props.config.deleteCommand,
          handlerConfig: props.config,
        })

        // TODO: Validate state?

        return {
          success: true,
          state,
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
