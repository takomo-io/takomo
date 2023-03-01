import { CommandHandler } from "../../../takomo-core/command.js"

import {
  createDeploymentTargetsContext,
  DeploymentTargetsConfigRepository,
} from "../../../context/targets-context.js"
import {
  ShowDeploymentTargetsConfigurationInput,
  ShowDeploymentTargetsConfigurationIO,
  ShowDeploymentTargetsConfigurationOutput,
} from "./model.js"

export const showDeploymentTargetsConfigurationCommand: CommandHandler<
  DeploymentTargetsConfigRepository,
  ShowDeploymentTargetsConfigurationIO,
  ShowDeploymentTargetsConfigurationInput,
  ShowDeploymentTargetsConfigurationOutput
> = async ({
  ctx,
  io,
  configRepository,
  input,
  credentialManager,
}): Promise<ShowDeploymentTargetsConfigurationOutput> =>
  createDeploymentTargetsContext({
    ctx,
    configRepository,
    credentialManager,
    logger: io,
  })
    .then(({ deploymentConfig }) => {
      const output: ShowDeploymentTargetsConfigurationOutput = {
        outputFormat: input.outputFormat,
        timer: input.timer,
        success: true,
        status: "SUCCESS",
        message: "Success",
        result: deploymentConfig,
      }

      return output
    })
    .then(io.printOutput)
