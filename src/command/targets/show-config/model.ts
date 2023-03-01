import { DeploymentConfig } from "../../../config/targets-config.js"
import {
  CommandInput,
  CommandOutput,
  IO,
} from "../../../takomo-core/command.js"

export type ShowDeploymentTargetsConfigurationInput = CommandInput

export interface ShowDeploymentTargetsConfigurationOutput
  extends CommandOutput {
  readonly result: DeploymentConfig
}

export type ShowDeploymentTargetsConfigurationIO =
  IO<ShowDeploymentTargetsConfigurationOutput>
