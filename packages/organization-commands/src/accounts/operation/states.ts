import {
  OrganizationConfigRepository,
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { Timer } from "@takomo/util"
import { OrganizationBasicConfigDeploymentPlan } from "../../common/plan/basic-config/model"
import { OrganizationalUnitsDeploymentPlan } from "../../common/plan/organizational-units/model"
import { PolicyDeploymentPlan } from "../../common/plan/policies/model"
import {
  AccountsLaunchPlan,
  AccountsOperationInput,
  AccountsOperationIO,
  OrganizationalUnitAccountsOperationResult,
} from "./model"
import { AccountsOperationTransitions } from "./transitions"

export interface InitialAccountsOperationState {
  readonly totalTimer: Timer
  readonly transitions: AccountsOperationTransitions
  readonly ctx: OrganizationContext
  readonly configRepository: OrganizationConfigRepository
  readonly io: AccountsOperationIO
  readonly input: AccountsOperationInput
}

export interface OrganizationStateHolder extends InitialAccountsOperationState {
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

export interface AccountsOperationPlanHolder extends OrganizationStateHolder {
  readonly accountsLaunchPlan: AccountsLaunchPlan
}

export interface AccountsOperationFailedState
  extends InitialAccountsOperationState {
  readonly message: string
  readonly error?: Error
}

export interface AccountsOperationSkippedState
  extends InitialAccountsOperationState {
  readonly message: string
}

export interface AccountsOperationCancelledState
  extends InitialAccountsOperationState {
  readonly message: string
}

export interface AccountsOperationCompletedState
  extends InitialAccountsOperationState {
  readonly message: string
  readonly results?: ReadonlyArray<OrganizationalUnitAccountsOperationResult>
}