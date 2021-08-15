import { StackOperationStep } from "../../common/steps"
import { TemplateLocationHolder } from "../states"

/**
 * @hidden
 */
export const summarizeTemplate: StackOperationStep<TemplateLocationHolder> =
  async (state) => {
    const { stack, templateS3Url, templateBody, transitions } = state
    const value = templateS3Url || templateBody
    const key = templateS3Url ? "TemplateURL" : "TemplateBody"

    const templateSummary = await stack
      .getCloudFormationClient()
      .getTemplateSummary({
        [key]: value,
      })

    return transitions.validateParameters({
      ...state,
      templateSummary,
    })
  }
