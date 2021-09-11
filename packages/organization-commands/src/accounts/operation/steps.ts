import { FAILED } from "@takomo/core"
import { TkmLogger } from "@takomo/util"
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
  logger: TkmLogger,
  stepName: string,
  step: AccountsOperationStep<S>,
  state: S,
): Promise<StepResult> => {
  logger.trace(`Begin step '${stepName}'`)
  const timer = state.totalTimer.startChild(stepName)
  try {
    return await step(state)
  } catch (error: any) {
    logger.error(`Unhandled error in step '${stepName}':`, error)
    return new AccountsOperationCompleted({
      ...state,
      result: {
        error,
        message: "An error occurred",
        success: false,
        status: FAILED,
        results: [],
        timer: state.totalTimer,
        outputFormat: state.input.outputFormat,
      },
    })
  } finally {
    timer.stop()
    logger.trace(
      `Step '${stepName}' completed in ${timer.getFormattedTimeElapsed()}`,
    )
  }
}

export const executeSteps = async (
  state: InitialAccountsOperationState,
): Promise<AccountsOperationOutput> => {
  const { transitions, totalTimer, io } = state

  let result = await transitions.start(state)
  while (!result.completed) {
    result = await executeStep(io, result.stepName, result.step, result.state)
  }

  totalTimer.stop()
  return result.state.result
}
