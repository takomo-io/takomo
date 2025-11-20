import { StackOperationStep } from "../../../common/steps.js"
import { CurrentStateHolder } from "../states.js"

export const deleteStack: StackOperationStep<CurrentStateHolder> = async (
  state,
) => {
  const {
    transitions,
    customStackHandler,
    currentState,
    customConfig,
    logger,
  } = state

  try {
    const { success, message, error } = await customStackHandler.delete({
      config: customConfig,
      logger: state.logger,
      state: currentState,
    })

    return transitions.completeStackOperation({
      ...state,
      events: [],
      status: success ? "SUCCESS" : "FAILED",
      message: message ?? "Stack delete succeeded",
      success,
      error,
    })
  } catch (e) {
    logger.error("Stack delete failed", e)
    return transitions.failStackOperation({
      ...state,
      error: e as Error,
      events: [],
      message: "Stack delete failed",
    })
  }
}
