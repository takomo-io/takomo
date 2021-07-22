import { FAILED } from "@takomo/core"
import { AccountsOperationOutput } from "./model"
import { InitialAccountsOperationState } from "./states"
import {
  AccountsOperationCompleted,
  AccountsOperationInProgress,
} from "./transitions"

export type StepResult =
  | AccountsOperationInProgress<any>
  | AccountsOperationCompleted

export type AccountsOperationStep<S extends InitialAccountsOperationState> = (
  state: S,
) => Promise<StepResult>

const executeStep = async <S extends InitialAccountsOperationState>(
  stepName: string,
  step: AccountsOperationStep<S>,
  state: S,
): Promise<StepResult> => {
  const childTimer = state.totalTimer.startChild(stepName)
  try {
    const result = await step(state)
    return result
  } catch (error) {
    return new AccountsOperationCompleted({
      ...state,
      results: [],
      outputFormat: state.input.outputFormat,
      error,
      message: "Error",
      status: FAILED,
      success: false,
    })
  } finally {
    childTimer.stop()
  }
}

export const executeSteps = async (
  state: InitialAccountsOperationState,
): Promise<AccountsOperationOutput> => {
  const { transitions, totalTimer } = state

  let result = await transitions.start(state)
  while (!result.completed) {
    result = await executeStep(result.stepName, result.step, result.state)
  }

  totalTimer.stop()
  return { ...result.props, timer: totalTimer }
}
