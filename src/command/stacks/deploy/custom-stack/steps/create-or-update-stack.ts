import { StackOperationStep } from "../../../common/steps.js"
import { TagsHolder } from "../states.js"

export const createOrUpdateStack: StackOperationStep<TagsHolder> = async (
  state,
) => {
  const { transitions, operationType } = state

  if (operationType === "UPDATE") {
    return transitions.updateStack(state)
  }

  if (operationType === "CREATE") {
    return transitions.createStack(state)
  }

  throw new Error(`Unsupported operation type: ${operationType}`)
}
