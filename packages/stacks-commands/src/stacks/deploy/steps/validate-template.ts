import { StackOperationStep } from "../../common/steps"
import { TemplateLocationHolder } from "../states"

/**
 * @hidden
 */
export const validateTemplate: StackOperationStep<TemplateLocationHolder> =
  async (state) => {
    const { stack, templateS3Url, templateBody, transitions } = state
    const value = templateS3Url || templateBody
    const key = templateS3Url ? "TemplateURL" : "TemplateBody"

    await stack.getCloudFormationClient().validateTemplate({
      [key]: value,
    })

    return transitions.summarizeTemplate(state)
  }
