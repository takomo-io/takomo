import { StackOperationStep } from "../../common/steps.js"
import { ParametersHolder } from "../states.js"

export const prepareTags: StackOperationStep<ParametersHolder> = (
  state: ParametersHolder,
) => {
  const { stack, logger, transitions } = state

  const tags = Array.from(stack.tags.entries()).map(([key, value]) => {
    const tag = {
      key,
      value: `${value}`,
    }
    logger.debugObject("Tag:", () => tag)
    return tag
  })

  return transitions.prepareTemplate({
    ...state,
    tags,
  })
}
