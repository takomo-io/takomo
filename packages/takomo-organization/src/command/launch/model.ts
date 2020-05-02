import { CommandInput, CommandOutput, IO } from "@takomo/core"
import { StopWatch } from "@takomo/util"
import {
  DeploymentPlanHolder,
  OrganizationalUnitsDeploymentResult,
  OrganizationBasicConfigDeploymentResult,
  PoliciesDeploymentResult,
} from "../../model"

export type LaunchOrganizationInput = CommandInput

export interface LaunchOrganizationOutput extends CommandOutput {
  readonly policiesDeploymentResult: PoliciesDeploymentResult
  readonly policiesCleanResult: PoliciesDeploymentResult
  readonly organizationalUnitsDeploymentResult: OrganizationalUnitsDeploymentResult
  readonly organizationalUnitsCleanResult: OrganizationalUnitsDeploymentResult
  readonly basicConfigDeploymentResult: OrganizationBasicConfigDeploymentResult
  readonly basicConfigCleanResult: OrganizationBasicConfigDeploymentResult
  readonly watch: StopWatch
}

export interface LaunchOrganizationIO extends IO {
  printOutput(output: LaunchOrganizationOutput): LaunchOrganizationOutput

  confirmLaunch(plan: DeploymentPlanHolder): Promise<boolean>
}
