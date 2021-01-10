import {
  OrganizationConfigRepository,
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { Timer } from "@takomo/util"
import { OrganizationBasicConfigDeploymentPlan } from "../common/plan/basic-config/model"
import { OrganizationalUnitsDeploymentPlan } from "../common/plan/organizational-units/model"
import { PolicyDeploymentPlan } from "../common/plan/policies/model"
import {
  DeployOrganizationIO,
  OrganizationalUnitsDeploymentResult,
  OrganizationBasicConfigDeploymentResult,
  PoliciesDeploymentResult,
} from "./model"
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
  readonly organizationBasicConfigPlan: OrganizationBasicConfigDeploymentPlan
}

export interface PoliciesPlanHolder extends BasicConfigPlanHolder {
  readonly policiesPlan: PolicyDeploymentPlan
}

export interface OrganizationalUnitsPlanHolder extends PoliciesPlanHolder {
  readonly organizationalUnitsPlan: OrganizationalUnitsDeploymentPlan
}

export interface OrganizationBasicConfigDeploymentResultHolder
  extends OrganizationalUnitsPlanHolder {
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

export interface DeployOrganizationFailedState
  extends InitialDeployOrganizationState {
  readonly message: string
  readonly error?: Error
  readonly organizationalUnitsCleanResult?: OrganizationalUnitsDeploymentResult
  readonly policiesCleanResult?: PoliciesDeploymentResult
  readonly organizationBasicConfigDeploymentResult?: OrganizationBasicConfigDeploymentResult
  readonly policiesDeploymentResult?: PoliciesDeploymentResult
  readonly organizationalUnitsDeploymentResult?: OrganizationalUnitsDeploymentResult
  readonly organizationBasicConfigCleanResult?: OrganizationBasicConfigDeploymentResult
}

export interface DeployOrganizationSkippedState
  extends InitialDeployOrganizationState {
  readonly message: string
}

export interface DeployOrganizationCancelledState
  extends InitialDeployOrganizationState {
  readonly message: string
}

export interface DeployOrganizationCompletedState
  extends InitialDeployOrganizationState {
  readonly message: string
  readonly organizationalUnitsCleanResult: OrganizationalUnitsDeploymentResult
  readonly policiesCleanResult: PoliciesDeploymentResult
  readonly organizationBasicConfigDeploymentResult: OrganizationBasicConfigDeploymentResult
  readonly policiesDeploymentResult: PoliciesDeploymentResult
  readonly organizationalUnitsDeploymentResult: OrganizationalUnitsDeploymentResult
  readonly organizationBasicConfigCleanResult: OrganizationBasicConfigDeploymentResult
}
