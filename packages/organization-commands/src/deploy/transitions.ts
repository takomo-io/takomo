import { DeployOrganizationOutput } from "./model"
import {
  BasicConfigPlanHolder,
  DeployOrganizationCancelledState,
  DeployOrganizationCompletedState,
  DeployOrganizationFailedState,
  DeployOrganizationSkippedState,
  InitialDeployOrganizationState,
  OrganizationalUnitsCleanResultHolder,
  OrganizationalUnitsDeploymentResultHolder,
  OrganizationalUnitsPlanHolder,
  OrganizationBasicConfigDeploymentResultHolder,
  OrganizationStateHolder,
  PoliciesCleanResultHolder,
  PoliciesDeploymentResultHolder,
  PoliciesPlanHolder,
} from "./states"
import { DeployOrganizationStep, StepResult } from "./steps"
import { cleanBasicConfig } from "./steps/clean-basic-config"
import { cleanOrganizationalUnits } from "./steps/clean-organizational-units"
import { cleanPolicies } from "./steps/clean-policies"
import { confirmDeployment } from "./steps/confirm-deployment"
import { deployBasicConfig } from "./steps/deploy-basic-config"
import { deployOrganizationalUnits } from "./steps/deploy-organizational-units"
import { deployPolicies } from "./steps/deploy-policies"
import { loadOrganizationData } from "./steps/load-organization-data"
import { planBasicConfig } from "./steps/plan-basic-config"
import { planOrganizationalUnits } from "./steps/plan-organizational-units"
import { planPolicies } from "./steps/plan-policies"
import { validateConfiguration } from "./steps/validate-configuration"

type OrganizationDeployCompletedProps = Omit<DeployOrganizationOutput, "timer">

export class OrganizationDeployCompleted {
  readonly completed = true
  readonly props: OrganizationDeployCompletedProps

  constructor(props: OrganizationDeployCompletedProps) {
    this.props = props
  }
}

interface OrganizationDeployInProgressProps<
  S extends InitialDeployOrganizationState
> {
  readonly stepName: string
  readonly step: DeployOrganizationStep<S>
  readonly state: S
}

export class OrganizationDeployInProgress<
  S extends InitialDeployOrganizationState
> {
  readonly completed = false
  readonly stepName: string
  readonly step: DeployOrganizationStep<S>
  readonly state: S

  constructor({ step, stepName, state }: OrganizationDeployInProgressProps<S>) {
    this.step = step
    this.stepName = stepName
    this.state = state
  }
}

export interface DeployOrganizationTransitions {
  start: DeployOrganizationStep<InitialDeployOrganizationState>
  validateConfiguration: DeployOrganizationStep<OrganizationStateHolder>
  cancelOrganizationDeploy: DeployOrganizationStep<
    DeployOrganizationCancelledState
  >
  skipOrganizationDeploy: DeployOrganizationStep<DeployOrganizationSkippedState>
  failOrganizationDeploy: DeployOrganizationStep<DeployOrganizationFailedState>
  completeOrganizationDeploy: DeployOrganizationStep<
    DeployOrganizationCompletedState
  >

  planBasicConfig: DeployOrganizationStep<OrganizationStateHolder>
  planPolicies: DeployOrganizationStep<BasicConfigPlanHolder>
  planOrganizationalUnits: DeployOrganizationStep<PoliciesPlanHolder>

  confirmDeployment: DeployOrganizationStep<OrganizationalUnitsPlanHolder>

  deployBasicConfig: DeployOrganizationStep<OrganizationalUnitsPlanHolder>
  deployPolicies: DeployOrganizationStep<
    OrganizationBasicConfigDeploymentResultHolder
  >
  deployOrganizationalUnits: DeployOrganizationStep<
    PoliciesDeploymentResultHolder
  >

  cleanOrganizationalUnits: DeployOrganizationStep<
    OrganizationalUnitsDeploymentResultHolder
  >
  cleanPolicies: DeployOrganizationStep<OrganizationalUnitsCleanResultHolder>
  cleanBasicConfig: DeployOrganizationStep<PoliciesCleanResultHolder>
}

export const inProgress = <S extends InitialDeployOrganizationState>(
  stepName: string,
  step: DeployOrganizationStep<S>,
): DeployOrganizationStep<S> => async (state: S) =>
  new OrganizationDeployInProgress({
    state,
    stepName,
    step,
  })

export const createDeployOrganizationTransitions = (): DeployOrganizationTransitions => ({
  cancelOrganizationDeploy: async (
    state: DeployOrganizationCancelledState,
  ): Promise<StepResult> =>
    new OrganizationDeployCompleted({
      message: state.message,
      success: false,
      status: "CANCELLED",
    }),
  completeOrganizationDeploy: async (
    state: DeployOrganizationCompletedState,
  ): Promise<StepResult> =>
    new OrganizationDeployCompleted({
      message: state.message,
      success: true,
      status: "SUCCESS",
    }),
  failOrganizationDeploy: async (
    state: DeployOrganizationFailedState,
  ): Promise<StepResult> =>
    new OrganizationDeployCompleted({
      message: state.message,
      success: false,
      status: "FAILED",
      error: state.error,
    }),
  skipOrganizationDeploy: async (
    state: DeployOrganizationSkippedState,
  ): Promise<StepResult> =>
    new OrganizationDeployCompleted({
      message: state.message,
      success: true,
      status: "SKIPPED",
    }),
  start: inProgress("load-organization-data", loadOrganizationData),
  validateConfiguration: inProgress(
    "validate-configuration",
    validateConfiguration,
  ),
  planBasicConfig: inProgress("plan-basic-config", planBasicConfig),
  planPolicies: inProgress("plan-policies", planPolicies),
  planOrganizationalUnits: inProgress(
    "plan-organizational-unuts",
    planOrganizationalUnits,
  ),
  confirmDeployment: inProgress("confirm-deployment", confirmDeployment),
  deployBasicConfig: inProgress("deploy-basic-config", deployBasicConfig),
  deployPolicies: inProgress("deploy-policies", deployPolicies),
  deployOrganizationalUnits: inProgress(
    "deploy-organizational-units",
    deployOrganizationalUnits,
  ),
  cleanOrganizationalUnits: inProgress(
    "clean-organizationaö-units",
    cleanOrganizationalUnits,
  ),
  cleanPolicies: inProgress("clean-policies", cleanPolicies),
  cleanBasicConfig: inProgress("clean-basic-config", cleanBasicConfig),
})
