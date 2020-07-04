import { StackResult } from "@takomo/stacks-model"
import { createOrUpdateStack } from "./execute"
import { ParameterHolder } from "./model"
import { reviewChanges } from "./review"

export const prepareTags = async (
  holder: ParameterHolder,
): Promise<StackResult> => {
  const { stack, watch, logger, state } = holder
  const childWatch = watch.startChild("prepare-tags")

  logger.debug("Prepare tags")

  const tags = Array.from(stack.getTags().entries()).map(([key, value]) => {
    const tag = {
      Key: key,
      Value: `${value}`,
    }
    logger.debugObject("Tag:", tag)
    return {
      Key: key,
      Value: value,
    }
  })

  childWatch.stop()

  if (state.autoConfirm) {
    return createOrUpdateStack({ ...holder, tags })
  }

  return reviewChanges({
    ...holder,
    tags,
  })
}
