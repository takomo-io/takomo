import { CANCELLED, FAILED, SKIPPED } from "@takomo/core"
import { AccountsOperationOutput } from "./model"
import {
  AccountsOperationCancelledState,
  AccountsOperationCompletedState,
  AccountsOperationFailedState,
  AccountsOperationPlanHolder,
  AccountsOperationSkippedState,
  InitialAccountsOperationState,
  OrganizationStateHolder,
} from "./states"
import { AccountsOperationStep, StepResult } from "./steps"
import { confirmOperation } from "./steps/confirm-operation"
import { executeOperation } from "./steps/execute-operation"
import { loadOrganizationData } from "./steps/load-organization-data"
import { planOperation } from "./steps/plan-operation"
import { validateConfiguration } from "./steps/validate-configuration"
import { validateInputs } from "./steps/validate-inputs"

type AccountsOperationCompletedProps = Omit<AccountsOperationOutput, "timer">

export class AccountsOperationCompleted {
  readonly completed = true
  readonly props: AccountsOperationCompletedProps

  constructor(props: AccountsOperationCompletedProps) {
    this.props = props
  }
}

interface AccountsOperationInProgressProps<
  S extends InitialAccountsOperationState,
> {
  readonly stepName: string
  readonly step: AccountsOperationStep<S>
  readonly state: S
}

export class AccountsOperationInProgress<
  S extends InitialAccountsOperationState,
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
  loadOrganizationData: AccountsOperationStep<InitialAccountsOperationState>
  validateConfiguration: AccountsOperationStep<OrganizationStateHolder>
  planOperation: AccountsOperationStep<OrganizationStateHolder>
  confirmOperation: AccountsOperationStep<AccountsOperationPlanHolder>
  executeOperation: AccountsOperationStep<AccountsOperationPlanHolder>
  cancelAccountsOperation: AccountsOperationStep<AccountsOperationCancelledState>
  skipAccountsOperation: AccountsOperationStep<AccountsOperationSkippedState>
  failAccountsOperation: AccountsOperationStep<AccountsOperationFailedState>
  completeAccountsOperation: AccountsOperationStep<AccountsOperationCompletedState>
}

export const inProgress =
  <S extends InitialAccountsOperationState>(
    stepName: string,
    step: AccountsOperationStep<S>,
  ): AccountsOperationStep<S> =>
  async (state: S) =>
    new AccountsOperationInProgress({
      state,
      stepName,
      step,
    })

export const createAccountsOperationTransitions =
  (): AccountsOperationTransitions => ({
    start: inProgress("validate-inputs", validateInputs),
    loadOrganizationData: inProgress(
      "load-organization-data",
      loadOrganizationData,
    ),
    validateConfiguration: inProgress(
      "validate-configuration",
      validateConfiguration,
    ),
    planOperation: inProgress("plan-operation", planOperation),
    confirmOperation: inProgress("confirm-operation", confirmOperation),
    executeOperation: inProgress("execute-operation", executeOperation),
    cancelAccountsOperation: async (
      state: AccountsOperationCancelledState,
    ): Promise<StepResult> =>
      new AccountsOperationCompleted({
        message: state.message,
        success: false,
        status: CANCELLED,
        outputFormat: state.input.outputFormat,
      }),

    completeAccountsOperation: async (
      state: AccountsOperationCompletedState,
    ): Promise<StepResult> =>
      new AccountsOperationCompleted({
        ...state,
        outputFormat: state.input.outputFormat,
      }),

    failAccountsOperation: async (
      state: AccountsOperationFailedState,
    ): Promise<StepResult> =>
      new AccountsOperationCompleted({
        ...state,
        success: false,
        status: FAILED,
        error: state.error,
        outputFormat: state.input.outputFormat,
      }),

    skipAccountsOperation: async (
      state: AccountsOperationSkippedState,
    ): Promise<StepResult> =>
      new AccountsOperationCompleted({
        ...state,
        success: true,
        status: SKIPPED,
        outputFormat: state.input.outputFormat,
      }),
  })
