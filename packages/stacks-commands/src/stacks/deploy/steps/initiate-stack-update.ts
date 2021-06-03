import { ALLOW_ALL_STACK_POLICY } from "@takomo/aws-model"
import { defaultCapabilities } from "@takomo/stacks-model"
import { uuid } from "@takomo/util"
import { StackOperationStep } from "../../common/steps"
import { UpdateStackHolder } from "../states"

/**
 * @hidden
 */
export const initiateStackUpdate: StackOperationStep<UpdateStackHolder> = async (
  state,
) => {
  const {
    stack,
    parameters,
    tags,
    templateS3Url,
    templateBody,
    terminationProtectionUpdated,
    transitions,
    currentStack,
  } = state

  const clientToken = uuid()
  const templateLocation = templateS3Url ?? templateBody
  const templateKey = templateS3Url ? "TemplateURL" : "TemplateBody"
  const capabilities = stack.capabilities?.slice() ?? defaultCapabilities

  // CloudFormation doesn't support removing of stack policy once it has been created.
  // As a workaround, when a stack policy is removed from the stack configuration, we
  // update the policy with the allow all policy.
  const stackPolicy =
    currentStack.stackPolicyBody && !stack.stackPolicy
      ? ALLOW_ALL_STACK_POLICY
      : stack.stackPolicy

  const hasChanges = await stack.getCloudFormationClient().updateStack({
    Capabilities: capabilities,
    ClientRequestToken: clientToken,
    Parameters: parameters.map((p) => ({
      ParameterKey: p.key,
      ParameterValue: p.value,
      UsePreviousValue: false,
    })),
    Tags: tags.map((t) => ({ Key: t.key, Value: t.value })),
    StackName: stack.name,
    StackPolicyBody: stackPolicy,
    StackPolicyDuringUpdateBody: stack.stackPolicyDuringUpdate,
    [templateKey]: templateLocation,
  })

  if (hasChanges) {
    return transitions.waitStackCreateOrUpdateToComplete({
      ...state,
      clientToken,
      stackId: currentStack.id,
    })
  }

  if (terminationProtectionUpdated) {
    return transitions.executeAfterDeployHooks({
      ...state,
      message: "Stack update succeeded",
      status: "SUCCESS",
      events: [],
      success: true,
    })
  }

  return transitions.executeAfterDeployHooks({
    ...state,
    message: "No changes",
    status: "SUCCESS",
    events: [],
    success: true,
  })
}
