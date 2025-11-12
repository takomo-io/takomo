import { ChangeSetType } from "../../../../../aws/cloudformation/model.js"
import { uuid } from "../../../../../utils/strings.js"
import {
  defaultCapabilities,
  StackOperationType,
} from "../../../../command-model.js"
import { StackOperationStep } from "../../../common/steps.js"
import { TemplateSummaryHolder } from "../states.js"

export const resolveChangeSetType = (
  type: StackOperationType,
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

export const initiateChangeSetCreate: StackOperationStep<
  TemplateSummaryHolder
> = async (state) => {
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

  const clientToken = uuid()
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

  const client = await stack.getCloudFormationClient()
  const changeSetId = await client.createChangeSet({
    StackName: stack.name,
    ChangeSetType: changeSetType,
    [templateKey]: templateLocation,
    ChangeSetName: changeSetName,
    Capabilities: stack.capabilities?.slice() ?? defaultCapabilities.slice(),
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
