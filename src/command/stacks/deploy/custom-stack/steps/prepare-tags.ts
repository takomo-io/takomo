import { arrayToRecord } from "../../../../../utils/collections.js"
import { StackOperationStep } from "../../../common/steps.js"
import { ParametersHolder } from "../states.js"

export const prepareTags: StackOperationStep<ParametersHolder> = (state) => {
  const { stack, logger, transitions } = state

  const tags = Array.from(stack.tags.entries()).map(([key, value]) => {
    const tag = {
      key,
      value: `${value}`,
    }
    logger.debugObject("Tag:", () => tag)
    return tag
  })

  return transitions.createOrUpdateStack({
    ...state,
    tags: arrayToRecord(
      tags,
      (p) => p.key,
      (p) => p.value,
    ),
  })
}
