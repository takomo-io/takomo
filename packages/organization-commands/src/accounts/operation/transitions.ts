import { CANCELLED, FAILED, SKIPPED, SUCCESS } from "@takomo/core"
import { AccountsOperationOutput } from "./model"
import {
  AccountsOperationCancelledState,
  AccountsOperationCompletedState,
  AccountsOperationFailedState,
  AccountsOperationPlanHolder,
  AccountsOperationSkippedState,
  BasicConfigPlanHolder,
  InitialAccountsOperationState,
  OrganizationalUnitsPlanHolder,
  OrganizationStateHolder,
  PoliciesPlanHolder,
} from "./states"
import { AccountsOperationStep, StepResult } from "./steps"
import { confirmOperation } from "./steps/confirm-operation"
import { executeOperation } from "./steps/execute-operation"
import { loadOrganizationData } from "./steps/load-organization-data"
import { planBasicConfig } from "./steps/plan-basic-config"
import { planOperation } from "./steps/plan-operation"
import { planOrganizationalUnits } from "./steps/plan-organizational-units"
import { planPolicies } from "./steps/plan-policies"
import { validateConfiguration } from "./steps/validate-configuration"
import { validateInputs } from "./steps/validate-inputs"
import { validateOrganizationState } from "./steps/validate-organization-state"

type AccountsOperationCompletedProps = Omit<AccountsOperationOutput, "timer">

export class AccountsOperationCompleted {
  readonly completed = true
  readonly props: AccountsOperationCompletedProps

  constructor(props: AccountsOperationCompletedProps) {
    this.props = props
  }
}

interface AccountsOperationInProgressProps<
  S extends InitialAccountsOperationState
> {
  readonly stepName: string
  readonly step: AccountsOperationStep<S>
  readonly state: S
}

export class AccountsOperationInProgress<
  S extends InitialAccountsOperationState
> {
  readonly completed = false
  readonly stepName: string
  readonly step: AccountsOperationStep<S>
  readonly state: S

  constructor({ step, stepName, state }: AccountsOperationInProgressProps<S>) {
    this.step = step
    this.stepName = stepName
    this.state = state
  }
}

export interface AccountsOperationTransitions {
  start: AccountsOperationStep<InitialAccountsOperationState>
  validateConfiguration: AccountsOperationStep<OrganizationStateHolder>

  planBasicConfig: AccountsOperationStep<OrganizationStateHolder>
  planPolicies: AccountsOperationStep<BasicConfigPlanHolder>
  planOrganizationalUnits: AccountsOperationStep<PoliciesPlanHolder>

  validateOrganizationState: AccountsOperationStep<
    OrganizationalUnitsPlanHolder
  >

  validateInputs: AccountsOperationStep<OrganizationStateHolder>

  planOperation: AccountsOperationStep<OrganizationStateHolder>
  confirmOperation: AccountsOperationStep<AccountsOperationPlanHolder>

  executeOperation: AccountsOperationStep<AccountsOperationPlanHolder>
  cancelAccountsOperation: AccountsOperationStep<
    AccountsOperationCancelledState
  >
  skipAccountsOperation: AccountsOperationStep<AccountsOperationSkippedState>
  failAccountsOperation: AccountsOperationStep<AccountsOperationFailedState>
  completeAccountsOperation: AccountsOperationStep<
    AccountsOperationCompletedState
  >
}

export const inProgress = <S extends InitialAccountsOperationState>(
  stepName: string,
  step: AccountsOperationStep<S>,
): AccountsOperationStep<S> => async (state: S) =>
  new AccountsOperationInProgress({
    state,
    stepName,
    step,
  })

export const createAccountsOperationTransitions = (): AccountsOperationTransitions => ({
  start: inProgress("load-organization-data", loadOrganizationData),
  validateOrganizationState: inProgress(
    "validate-organization-state",
    validateOrganizationState,
  ),
  planOperation: inProgress("plan-operation", planOperation),
  confirmOperation: inProgress("confirm-operation", confirmOperation),
  executeOperation: inProgress("execute-operation", executeOperation),
  planBasicConfig: inProgress("plan-basic-config", planBasicConfig),
  planOrganizationalUnits: inProgress(
    "plan-organizational-units",
    planOrganizationalUnits,
  ),
  planPolicies: inProgress("plan-policies", planPolicies),
  validateInputs: inProgress("validate-inputs", validateInputs),
  validateConfiguration: inProgress(
    "validate-configuration",
    validateConfiguration,
  ),
  cancelAccountsOperation: async (
    state: AccountsOperationCancelledState,
  ): Promise<StepResult> =>
    new AccountsOperationCompleted({
      message: state.message,
      success: false,
      status: CANCELLED,
    }),

  completeAccountsOperation: async (
    state: AccountsOperationCompletedState,
  ): Promise<StepResult> =>
    new AccountsOperationCompleted({
      ...state,
      success: true,
      status: SUCCESS,
    }),

  failAccountsOperation: async (
    state: AccountsOperationFailedState,
  ): Promise<StepResult> =>
    new AccountsOperationCompleted({
      ...state,
      success: false,
      status: FAILED,
      error: state.error,
    }),

  skipAccountsOperation: async (
    state: AccountsOperationSkippedState,
  ): Promise<StepResult> =>
    new AccountsOperationCompleted({
      ...state,
      success: true,
      status: SKIPPED,
    }),
})
