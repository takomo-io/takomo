import { StackOperationStep } from "../../../common/steps.js"
import { TagsHolder } from "../states.js"

export const createStack: StackOperationStep<TagsHolder> = async (state) => {
  const { stack, logger, transitions, parameters, tags, customStackHandler } =
    state

  logger.info(`Creating custom stack of type '${stack.customType}'`)

  try {
    const result = await customStackHandler.create({
      config: stack.customConfig,
      logger,
      parameters,
      tags,
    })

    if (result.success) {
      logger.info("Custom stack create succeeded")

      return transitions.completeStackOperation({
        ...state,
        events: [],
        status: "SUCCESS",
        message: "Stack create succeeded",
        success: true,
      })
    }

    logger.error("Custom stack create failed", result.error)

    return transitions.failStackOperation({
      ...state,
      error: result.error,
      events: [],
      message: result.message ?? "Stack create failed",
    })
  } catch (e) {
    logger.error("Custom stack create failed due to unhandled error", e)

    return transitions.failStackOperation({
      ...state,
      error: e as Error,
      events: [],
      message: "Stack create failed",
    })
  }
}
