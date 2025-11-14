import { StackOperationStep } from "../../../common/steps.js"
import { CurrentStackHolder } from "../states.js"

export const updateStack: StackOperationStep<CurrentStackHolder> = async (
  state,
) => {
  const {
    stack,
    logger,
    transitions,
    operationType,
    parameters,
    tags,
    currentStack,
    customStackHandler,
  } = state

  logger.info(`Updating custom stack of type '${stack.type}'`)
  const result = await customStackHandler.update({
    state: currentStack,
    config: stack.config,
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
