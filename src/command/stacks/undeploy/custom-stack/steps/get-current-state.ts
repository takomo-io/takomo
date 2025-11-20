import { StackOperationStep } from "../../../common/steps.js"
import { CustomConfigHolder } from "../states.js"

export const getCurrentState: StackOperationStep<CustomConfigHolder> = async (
  state,
) => {
  const { transitions, stack, customStackHandler, customConfig } = state

  try {
    const { currentState, success, error, message, logger } =
      await customStackHandler.getCurrentState({
        logger: stack.logger,
        config: customConfig,
      })

    if (!success) {
      logger.error("Getting current state failed")
      return transitions.failStackOperation({
        ...state,
        error,
        events: [],
        message: message ?? "Getting current state failed",
      })
    }

    return transitions.deleteStack({
      ...state,
      currentState,
    })
  } catch (e) {
    state.logger.error("Getting current state failed", e)
    return transitions.failStackOperation({
      ...state,
      error: e as Error,
      events: [],
      message: "Getting current state failed",
    })
  }
}
