import { defaultCapabilities } from "../../../../takomo-stacks-model"
import { uuid } from "../../../../takomo-util"
import { StackOperationStep } from "../../common/steps"
import { TemplateSummaryHolder } from "../states"

export const initiateStackCreate: StackOperationStep<
  TemplateSummaryHolder
> = async (state) => {
  const { stack, parameters, tags, templateS3Url, templateBody, transitions } =
    state

  const clientToken = uuid()
  const templateLocation = templateS3Url ?? templateBody
  const templateKey = templateS3Url ? "TemplateURL" : "TemplateBody"
  const capabilities = stack.capabilities?.slice() ?? defaultCapabilities

  const stackId = await stack.getCloudFormationClient().createStack({
    Capabilities: capabilities,
    ClientRequestToken: clientToken,
    DisableRollback: false,
    EnableTerminationProtection: stack.terminationProtection,
    Parameters: parameters.map((p) => ({
      ParameterKey: p.key,
      ParameterValue: p.value,
      UsePreviousValue: false,
    })),
    Tags: tags.map((t) => ({ Key: t.key, Value: t.value })),
    StackName: stack.name,
    TimeoutInMinutes: stack.timeout.create || undefined,
    StackPolicyBody: stack.stackPolicy,
    [templateKey]: templateLocation,
  })

  return transitions.waitStackCreateOrUpdateToComplete({
    ...state,
    clientToken,
    stackId,
  })
}
