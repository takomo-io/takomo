import { StackOperationStep } from "../../../common/steps.js"
import { ChangesHolder } from "../states.js"

export const updateStack: StackOperationStep<ChangesHolder> = async (state) => {
  const {
    stack,
    logger,
    transitions,
    parameters,
    tags,
    currentStatus,
    customStackHandler,
    ctx,
  } = state

  logger.info(`Updating custom stack of type '${stack.customType}'`)

  try {
    const result = await customStackHandler.update({
      state: currentStatus,
      config: stack.customConfig,
      logger,
      parameters,
      tags,
      stack,
      ctx,
    })

    if (result.success) {
      logger.info("Custom stack update succeeded")

      return transitions.completeStackOperation({
        ...state,
        events: [],
        status: "SUCCESS",
        message: "Stack update succeeded",
        success: true,
      })
    }

    logger.error("Custom stack update failed", result.error)

    return transitions.failStackOperation({
      ...state,
      error: result.error,
      events: [],
      message: result.message ?? "Stack update failed",
    })
  } catch (e) {
    logger.error("Custom stack update failed due to unhandled error", e)

    return transitions.failStackOperation({
      ...state,
      error: e as Error,
      events: [],
      message: "Stack update failed",
    })
  }
}
