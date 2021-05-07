import { CommandOutputBase } from "@takomo/core"
import {
  OrganizationConfigRepository,
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { Timer } from "@takomo/util"
import { OrganizationBasicConfigDeploymentPlan } from "../common/plan/basic-config/model"
import { OrganizationalUnitsDeploymentPlan } from "../common/plan/organizational-units/model"
import { PolicyDeploymentPlan } from "../common/plan/policies/model"
import { DeployOrganizationIO } from "./model"
import { DeployOrganizationTransitions } from "./transitions"

export interface InitialDeployOrganizationState {
  readonly totalTimer: Timer
  readonly transitions: DeployOrganizationTransitions
  readonly ctx: OrganizationContext
  readonly configRepository: OrganizationConfigRepository
  readonly io: DeployOrganizationIO
}

export interface OrganizationStateHolder
  extends InitialDeployOrganizationState {
  readonly organizationState: OrganizationState
}

export interface BasicConfigPlanHolder extends OrganizationStateHolder {
  readonly basicConfigPlan: OrganizationBasicConfigDeploymentPlan
}

export interface PoliciesPlanHolder extends BasicConfigPlanHolder {
  readonly policiesPlan: PolicyDeploymentPlan
}

export interface OrganizationalUnitsPlanHolder extends PoliciesPlanHolder {
  readonly organizationalUnitsPlan: OrganizationalUnitsDeploymentPlan
}

export interface BasicConfigDeploymentResultHolder
  extends OrganizationalUnitsPlanHolder {
  readonly basicConfigDeploymentResult: CommandOutputBase
}

export interface PoliciesDeploymentResultHolder
  extends BasicConfigDeploymentResultHolder {
  readonly policiesDeploymentResult: CommandOutputBase
}

export interface OrganizationalUnitsDeploymentResultHolder
  extends PoliciesDeploymentResultHolder {
  readonly organizationalUnitsDeploymentResult: CommandOutputBase
}

export interface OrganizationalUnitsCleanResultHolder
  extends OrganizationalUnitsDeploymentResultHolder {
  readonly organizationalUnitsCleanResult: CommandOutputBase
}

export interface PoliciesCleanResultHolder
  extends OrganizationalUnitsCleanResultHolder {
  readonly policiesCleanResult: CommandOutputBase
}

export interface DeployOrganizationCompletedState
  extends InitialDeployOrganizationState {
  readonly message: string
  readonly basicConfigDeploymentResult: CommandOutputBase
  readonly organizationalUnitsCleanResult: CommandOutputBase
  readonly organizationalUnitsDeploymentResult: CommandOutputBase
  readonly policiesDeploymentResult: CommandOutputBase
  readonly policiesCleanResult: CommandOutputBase
}
