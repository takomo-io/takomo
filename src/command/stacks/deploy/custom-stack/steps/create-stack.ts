import { StackOperationStep } from "../../../common/steps.js"
import { TagsHolder } from "../states.js"

export const createStack: StackOperationStep<TagsHolder> = async (state) => {
  const {
    stack,
    logger,
    transitions,
    operationType,
    parameters,
    tags,
    customStackHandler,
  } = state

  // TODO: Perform stack create or update operation here...

  logger.info(`Creating custom stack of type '${stack.customType}'`)
  const result = await customStackHandler.create({
    config: stack.customConfig,
    logger,
    parameters,
    tags,
  })

  return transitions.completeStackOperation({
    ...state,
    events: [], // TODO: Should we get events somehow?
    status: "SUCCESS",
    message:
      operationType === "UPDATE"
        ? "Stack update succeeded"
        : "Stack create succeeded",
    success: true,
  })
}
