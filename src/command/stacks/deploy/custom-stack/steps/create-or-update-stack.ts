import { StackOperationStep } from "../../../common/steps.js"
import { ChangesHolder } from "../states.js"

export const createOrUpdateStack: StackOperationStep<ChangesHolder> = async (
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
