import { CommandHandler } from "../../takomo-core"
import {
  createDeploymentTargetsContext,
  DeploymentTargetsConfigRepository,
} from "../../takomo-deployment-targets-context"
import {
  ShowDeploymentTargetsConfigurationInput,
  ShowDeploymentTargetsConfigurationIO,
  ShowDeploymentTargetsConfigurationOutput,
} from "./model"

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
