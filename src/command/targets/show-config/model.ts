import { CommandInput, CommandOutput, IO } from "../../../takomo-core"
import { DeploymentConfig } from "../../../takomo-deployment-targets-config"

export type ShowDeploymentTargetsConfigurationInput = CommandInput

export interface ShowDeploymentTargetsConfigurationOutput
  extends CommandOutput {
  readonly result: DeploymentConfig
}

export type ShowDeploymentTargetsConfigurationIO =
  IO<ShowDeploymentTargetsConfigurationOutput>
