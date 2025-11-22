import { StackOperationStep } from "../../../common/steps.js"
import { InitialUndeployCustomStackState } from "../states.js"

export const deleteStack: StackOperationStep<
  InitialUndeployCustomStackState
> = async (state) => {
  const { transitions, currentState, logger, stack } = state

  try {
    const result = await stack.customStackHandler.delete({
      config: stack.customConfig,
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
