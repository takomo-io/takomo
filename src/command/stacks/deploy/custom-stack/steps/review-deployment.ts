import { StackOperationStep } from "../../../common/steps.js"
import { ChangesHolder } from "../states.js"

export const reviewDeployment: StackOperationStep<ChangesHolder> = async (
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
    changes,
  } = state

  const answer = await io.confirmCustomStackDeploy(
    stack,
    operationType,
    currentStatus,
    tags,
    parameters,
    changes,
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
