import { StackResult } from "@takomo/stacks-model"
import { ParameterHolder } from "./model"
import { prepareCloudFormationTemplate } from "./template"

export const prepareTags = async (
  holder: ParameterHolder,
): Promise<StackResult> => {
  const { stack, watch, logger } = holder
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

  return prepareCloudFormationTemplate({ ...holder, tags })
}
