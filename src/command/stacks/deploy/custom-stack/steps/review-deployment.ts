import { StackOperationStep } from "../../../common/steps.js"
import { TagsHolder } from "../states.js"

export const reviewDeployment: StackOperationStep<TagsHolder> = async (
  state,
) => {
  const {
    stack,
    transitions,
    io,
    operationType,
    currentStatus,
    tags,
    parameters,
    state: deployState,
  } = state

  const answer = await io.confirmCustomStackDeploy(
    stack,
    operationType,
    currentStatus,
    tags,
    parameters,
  )

  if (answer === "CANCEL") {
    return transitions.cancelStackOperation({
      ...state,
      message: "Cancelled",
    })
  }

  if (answer === "CONTINUE_AND_SKIP_REMAINING_REVIEWS") {
    deployState.autoConfirm = true
  }

  return transitions.createOrUpdateStack(state)
}
