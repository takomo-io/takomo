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
export const inProgress =
  <S extends InitialStackOperationState>(
    stepName: string,
    step: StackOperationStep<S>,
  ): StackOperationStep<S> =>
  async (state: S) =>
    new StackOperationInProgress({
      state,
      stepName,
      step,
    })

/**
 * @hidden
 */
export const defaultStackOperationTransitions = {
  cancelStackOperation: async ({
    message,
    stack,
    operationType,
    stackExistedBeforeOperation,
  }: StackOperationCancelledState): Promise<StepResult> =>
    new StackOperationCompleted({
      message,
      stack,
      operationType,
      stackExistedBeforeOperation,
      success: false,
      status: "CANCELLED",
      events: [],
    }),

  completeStackOperation: async (
    state: StackOperationCompletedState,
  ): Promise<StepResult> => new StackOperationCompleted(state),

  failStackOperation: async ({
    message,
    stack,
    events,
    error,
    operationType,
    stackExistedBeforeOperation,
  }: StackOperationFailedState): Promise<StepResult> =>
    new StackOperationCompleted({
      message,
      stack,
      events,
      error,
      operationType,
      stackExistedBeforeOperation,
      success: false,
      status: "FAILED",
    }),

  skipStackOperation: async ({
    message,
    stack,
    operationType,
    stackExistedBeforeOperation,
  }: StackOperationSkippedState): Promise<StepResult> =>
    new StackOperationCompleted({
      message,
      stack,
      operationType,
      stackExistedBeforeOperation,
      success: true,
      status: "SKIPPED",
      events: [],
    }),
}
