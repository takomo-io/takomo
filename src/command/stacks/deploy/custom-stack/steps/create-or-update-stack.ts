import { StackOperationStep } from "../../../common/steps.js"
import { TagsHolder } from "../states.js"

export const createOrUpdateStack: StackOperationStep<TagsHolder> = async (
  state,
) => {
  const { transitions, currentStack } = state

  if (currentStack) {
    return transitions.updateStack({
      ...state,
      currentStack: currentStack,
    })
  }

  return transitions.createStack(state)
}
