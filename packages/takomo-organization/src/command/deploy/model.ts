import { CommandInput, CommandOutput, IO } from "@takomo/core"
import { StopWatch } from "@takomo/util"
import {
  DeploymentPlanHolder,
  OrganizationalUnitsDeploymentResult,
  OrganizationBasicConfigDeploymentResult,
  PoliciesDeploymentResult,
} from "../../model"

export type DeployOrganizationInput = CommandInput

export interface DeployOrganizationOutput extends CommandOutput {
  readonly policiesDeploymentResult: PoliciesDeploymentResult
  readonly policiesCleanResult: PoliciesDeploymentResult
  readonly organizationalUnitsDeploymentResult: OrganizationalUnitsDeploymentResult
  readonly organizationalUnitsCleanResult: OrganizationalUnitsDeploymentResult
  readonly basicConfigDeploymentResult: OrganizationBasicConfigDeploymentResult
  readonly basicConfigCleanResult: OrganizationBasicConfigDeploymentResult
  readonly watch: StopWatch
}

export interface DeployOrganizationIO extends IO {
  printOutput(output: DeployOrganizationOutput): DeployOrganizationOutput

  confirmLaunch(plan: DeploymentPlanHolder): Promise<boolean>
}
