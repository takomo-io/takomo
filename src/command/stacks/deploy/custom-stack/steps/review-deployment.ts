import { StackOperationStep } from "../../../common/steps.js"
import { TagsHolder } from "../states.js"

export const reviewDeployment: StackOperationStep<TagsHolder> = (state) => {
  const { stack, logger, transitions } = state

  // TODO: Review deployment details

  return transitions.createOrUpdateStack(state)
}
