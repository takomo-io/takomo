import { CommandHandler } from "../../../takomo-core/command.js"

import {
  createDeploymentTargetsContext,
  DeploymentTargetsConfigRepository,
} from "../../../context/targets-context.js"
import {
  ValidateDeploymentTargetsConfigurationInput,
  ValidateDeploymentTargetsConfigurationIO,
  ValidateDeploymentTargetsConfigurationOutput,
} from "./model.js"

export const validateDeploymentTargetsConfigurationCommand: CommandHandler<
  DeploymentTargetsConfigRepository,
  ValidateDeploymentTargetsConfigurationIO,
  ValidateDeploymentTargetsConfigurationInput,
  ValidateDeploymentTargetsConfigurationOutput
> = async ({
  ctx,
  io,
  configRepository,
  input,
  credentialManager,
}): Promise<ValidateDeploymentTargetsConfigurationOutput> =>
  createDeploymentTargetsContext({
    ctx,
    configRepository,
    credentialManager,
    logger: io,
  })
    .then(() => {
      const output: ValidateDeploymentTargetsConfigurationOutput = {
        outputFormat: input.outputFormat,
        timer: input.timer,
        success: true,
        status: "SUCCESS",
        message: "Success",
      }

      return output
    })
    .then(io.printOutput)
