import { arrayToRecord } from "../../../../../utils/collections.js"
import { StackOperationStep } from "../../../common/steps.js"
import { ParametersHolder } from "../states.js"

export const prepareTags: StackOperationStep<ParametersHolder> = (state) => {
  const { stack, logger, transitions, emit } = state

  const tags = Array.from(stack.tags.entries()).map(([key, value]) => {
    const tag = {
      key,
      value: `${value}`,
    }
    logger.debugObject("Tag:", () => tag)
    return tag
  })

  const updatedState = {
    ...state,
    tags: arrayToRecord(
      tags,
      (p) => p.key,
      (p) => p.value,
    ),
  }

  if (emit) {
    return transitions.completeStackOperation({
      ...updatedState,
      message: "Emit template not supported",
      success: true,
      status: "SUCCESS",
      events: [],
    })
  }

  if (state.state.autoConfirm) {
    return transitions.createOrUpdateStack(updatedState)
  }

  return transitions.reviewDeployment(updatedState)
}
