import { StackOperationStep } from "../../common/steps.js"
import { TemplateLocationHolder } from "../states.js"

export const validateTemplate: StackOperationStep<
  TemplateLocationHolder
> = async (state) => {
  const { stack, templateS3Url, templateBody, transitions } = state
  const value = templateS3Url || templateBody
  const key = templateS3Url ? "TemplateURL" : "TemplateBody"

  const client = await stack.getCloudFormationClient()
  await client.validateTemplate({
    [key]: value,
  })

  return transitions.summarizeTemplate(state)
}
