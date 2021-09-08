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
    return await step(state)
  } catch (error) {
    return new AccountsOperationCompleted({
      ...state,
      result: {
        message: "An error occurred",
        success: false,
        status: FAILED,
        results: [],
        timer: state.totalTimer,
        error,
        outputFormat: state.input.outputFormat,
      },
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
  return result.state.result
}
