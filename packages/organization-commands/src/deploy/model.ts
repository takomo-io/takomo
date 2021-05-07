import {
  OrganizationPolicy,
  OrganizationPolicyName,
  OrganizationPolicyType,
} from "@takomo/aws-model"
import {
  CommandInput,
  CommandOutput,
  CommandOutputBase,
  IO,
} from "@takomo/core"
import { OrganizationBasicConfigDeploymentPlan } from "../common/plan/basic-config/model"
import { OrganizationalUnitsDeploymentPlan } from "../common/plan/organizational-units/model"
import { PolicyDeploymentPlan } from "../common/plan/policies/model"

export type DeployOrganizationInput = CommandInput

export interface DeployOrganizationOutput extends CommandOutput {
  readonly policiesDeploymentResult?: CommandOutputBase
  readonly policiesCleanResult?: CommandOutputBase
  readonly organizationalUnitsDeploymentResult?: CommandOutputBase
  readonly organizationalUnitsCleanResult?: CommandOutputBase
  readonly basicConfigDeploymentResult?: CommandOutputBase
}

export interface ConfirmOrganizationDeployProps {
  readonly basicConfigPlan: OrganizationBasicConfigDeploymentPlan
  readonly policiesPlan: PolicyDeploymentPlan
  readonly organizationalUnitsPlan: OrganizationalUnitsDeploymentPlan
}

export interface DeployOrganizationIO extends IO<DeployOrganizationOutput> {
  readonly confirmDeploy: (
    props: ConfirmOrganizationDeployProps,
  ) => Promise<boolean>
}

export interface PolicyDeploymentResult extends CommandOutputBase {
  readonly type: OrganizationPolicyType
  readonly name: OrganizationPolicyName
  readonly awsManaged: boolean
  readonly policy?: OrganizationPolicy
}

export interface OrganizationalUnitDeploymentResult extends CommandOutputBase {
  readonly id: string | null
  readonly name: string
}
