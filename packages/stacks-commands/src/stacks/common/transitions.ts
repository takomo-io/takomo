import {
  InitialStackOperationState,
  StackOperationCancelledState,
  StackOperationCompletedState,
  StackOperationFailedState,
  StackOperationSkippedState,
} from "./states"
import {
  StackOperationCompleted,
  StackOperationInProgress,
  StackOperationStep,
  StepResult,
} from "./steps"

/**
 * @hidden
 */
export interface StackOperationTransitions {
  start: StackOperationStep<any>
  cancelStackOperation: StackOperationStep<StackOperationCancelledState>
  skipStackOperation: StackOperationStep<StackOperationSkippedState>
  failStackOperation: StackOperationStep<StackOperationFailedState>
  completeStackOperation: StackOperationStep<StackOperationCompletedState>
}

/**
 * @hidden
 */
export const inProgress = <S extends InitialStackOperationState>(
  stepName: string,
  step: StackOperationStep<S>,
): StackOperationStep<S> => async (state: S) =>
  new StackOperationInProgress({
    state,
    stepName,
    step,
  })

/**
 * @hidden
 */
export const defaultStackOperationTransitions = {
  cancelStackOperation: async (
    state: StackOperationCancelledState,
  ): Promise<StepResult> =>
    new StackOperationCompleted({
      message: state.message,
      success: false,
      status: "CANCELLED",
      stack: state.stack,
      events: [],
    }),

  completeStackOperation: async (
    state: StackOperationCompletedState,
  ): Promise<StepResult> =>
    new StackOperationCompleted({
      message: state.message,
      success: state.success,
      status: state.status,
      stack: state.stack,
      events: [],
    }),

  failStackOperation: async (
    state: StackOperationFailedState,
  ): Promise<StepResult> =>
    new StackOperationCompleted({
      message: state.message,
      success: false,
      status: "FAILED",
      stack: state.stack,
      events: state.events,
      error: state.error,
    }),

  skipStackOperation: async (
    state: StackOperationSkippedState,
  ): Promise<StepResult> =>
    new StackOperationCompleted({
      message: state.message,
      success: true,
      status: "SKIPPED",
      stack: state.stack,
      events: [],
    }),
}
