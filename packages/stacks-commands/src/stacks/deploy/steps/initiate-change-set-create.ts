import { defaultCapabilities } from "@takomo/stacks-model"
import { ChangeSetType } from "aws-sdk/clients/cloudformation"
import uuid from "uuid"
import { StackOperationStep } from "../../common/steps"
import { StackDeployOperationType } from "../plan"
import { TemplateSummaryHolder } from "../states"

export const resolveChangeSetType = (
  type: StackDeployOperationType,
): ChangeSetType => {
  switch (type) {
    case "UPDATE":
      return "UPDATE"
    case "CREATE":
    case "RECREATE":
      return "CREATE"
    default:
      throw new Error(`Unsupported stack operation type: ${type}`)
  }
}

/**
 * @hidden
 */
export const initiateChangeSetCreate: StackOperationStep<TemplateSummaryHolder> = async (
  state,
) => {
  const {
    stack,
    operationType,
    templateS3Url,
    templateBody,
    parameters,
    tags,
    logger,
    transitions,
  } = state

  const clientToken = uuid.v4()
  const changeSetName = `change-${clientToken}`
  const changeSetType = resolveChangeSetType(operationType)
  const templateLocation = templateS3Url || templateBody
  const templateKey = templateS3Url ? "TemplateURL" : "TemplateBody"

  logger.info("Create change set")
  logger.debugObject("Change set data:", {
    clientToken,
    name: changeSetName,
    type: changeSetType,
  })

  const changeSetId = await stack.getCloudFormationClient().createChangeSet({
    StackName: stack.name,
    ChangeSetType: changeSetType,
    [templateKey]: templateLocation,
    ChangeSetName: changeSetName,
    Capabilities: stack.capabilities?.slice() ?? defaultCapabilities,
    Parameters: parameters.map((p) => ({
      ParameterKey: p.key,
      ParameterValue: p.value,
      UsePreviousValue: false,
    })),
    Tags: tags.map((t) => ({ Key: t.key, Value: t.value })),
  })

  logger.debug(`Change set created successfully with id ${changeSetId}`)

  return transitions.waitChangeSetToBeReady({ ...state, changeSetName })
}
