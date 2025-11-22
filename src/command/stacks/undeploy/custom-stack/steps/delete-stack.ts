import { StackOperationStep } from "../../../common/steps.js"
import { InitialUndeployCustomStackState } from "../states.js"

export const deleteStack: StackOperationStep<
  InitialUndeployCustomStackState
> = async (state) => {
  const {
    transitions,
    customStackHandler,
    currentState,
    customConfig,
    logger,
  } = state

  try {
    const result = await customStackHandler.delete({
      config: customConfig,
      logger: state.logger,
      state: currentState,
    })

    if (result.success) {
      return transitions.completeStackOperation({
        ...state,
        events: [],
        status: "SUCCESS",
        message: "Stack delete succeeded",
        success: true,
      })
    }

    logger.error("Stack delete failed", result.error)

    return transitions.failStackOperation({
      ...state,
      error: result.error,
      events: [],
      message: result.message ?? "Stack delete failed",
    })
  } catch (e) {
    logger.error("Stack delete failed due to unhandled error", e)
    return transitions.failStackOperation({
      ...state,
      error: e as Error,
      events: [],
      message: "Stack delete failed",
    })
  }
}
