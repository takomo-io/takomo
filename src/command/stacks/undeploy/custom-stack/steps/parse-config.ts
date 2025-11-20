import { StackOperationStep } from "../../../common/steps.js"
import { InitialUndeployCustomStackState } from "../states.js"

export const parseConfig: StackOperationStep<
  InitialUndeployCustomStackState
> = async (state) => {
  const { transitions, customStackHandler, logger } = state

  try {
    const { config, success, error, message } =
      await customStackHandler.parseConfig({
        logger: state.logger,
        config: state.stack.customConfig,
      })

    if (!success) {
      logger.error("Parsing custom stack config failed")
      return transitions.failStackOperation({
        ...state,
        error,
        events: [],
        message: message ?? "Parsing custom stack config failed",
      })
    }

    return transitions.deleteStack({
      ...state,
      customConfig: config,
    })
  } catch (e) {
    logger.error("Parsing custom stack config failed", e)
    return transitions.failStackOperation({
      ...state,
      error: e as Error,
      events: [],
      message: "Parsing custom stack config failed",
    })
  }
}
