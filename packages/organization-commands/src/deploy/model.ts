import {
  CommandInput,
  CommandOutput,
  CommandOutputBase,
  IO,
} from "@takomo/core"
import {
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { StopWatch } from "@takomo/util"
import { Policy } from "aws-sdk/clients/organizations"
import { OrganizationLaunchPlan } from "./plan/model"

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
  printOutput: (output: DeployOrganizationOutput) => DeployOrganizationOutput

  confirmLaunch: (plan: DeploymentPlanHolder) => Promise<boolean>
}

export interface PolicyDeploymentResult extends CommandOutputBase {
  readonly id: string
  readonly type: string
  readonly name: string
  readonly awsManaged: boolean
  readonly policy: Policy | null
}

export interface PoliciesDeploymentResult extends CommandOutputBase {
  readonly results: PolicyDeploymentResult[]
}

export interface OrganizationalUnitDeploymentResult extends CommandOutputBase {
  readonly id: string | null
  readonly name: string
}

export interface OrganizationalUnitsDeploymentResult extends CommandOutputBase {
  readonly results: OrganizationalUnitDeploymentResult[]
}

export type OrganizationBasicConfigDeploymentResult = CommandOutputBase

export interface InitialOrganizationDeployContext {
  readonly watch: StopWatch
  readonly ctx: OrganizationContext
  readonly io: DeployOrganizationIO
  readonly input: DeployOrganizationInput
  readonly result: CommandOutputBase | null
}

export interface OrganizationDataHolder
  extends InitialOrganizationDeployContext {
  organizationState: OrganizationState
}

export interface DeploymentPlanHolder extends OrganizationDataHolder {
  readonly plan: OrganizationLaunchPlan
}

export interface OrganizationBasicConfigDeploymentResultHolder
  extends DeploymentPlanHolder {
  readonly organizationBasicConfigDeploymentResult: OrganizationBasicConfigDeploymentResult
}

export interface PoliciesDeploymentResultHolder
  extends OrganizationBasicConfigDeploymentResultHolder {
  readonly policiesDeploymentResult: PoliciesDeploymentResult
}

export interface OrganizationalUnitsDeploymentResultHolder
  extends PoliciesDeploymentResultHolder {
  readonly organizationalUnitsDeploymentResult: OrganizationalUnitsDeploymentResult
}

export interface OrganizationalUnitsCleanResultHolder
  extends OrganizationalUnitsDeploymentResultHolder {
  readonly organizationalUnitsCleanResult: OrganizationalUnitsDeploymentResult
}

export interface PoliciesCleanResultHolder
  extends OrganizationalUnitsCleanResultHolder {
  readonly policiesCleanResult: PoliciesDeploymentResult
}

export interface OrganizationBasicConfigCleanResultHolder
  extends PoliciesCleanResultHolder {
  readonly organizationBasicConfigCleanResult: OrganizationBasicConfigDeploymentResult
}
