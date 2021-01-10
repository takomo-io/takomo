import {
  ChangeSet,
  DetailedChangeSet,
  TemplateSummary,
} from "@takomo/aws-model"
import { StackOperationStep } from "../../common/steps"
import { ChangeSetNameHolder } from "../states"

const enrichChangeSet = (
  changeSet: ChangeSet,
  templateSummary: TemplateSummary,
): DetailedChangeSet => {
  const declarationMap = new Map(
    templateSummary.parameters.map((p) => [p.key, p]),
  )

  const parameters = changeSet.parameters.map((parameter) => {
    const declaration = declarationMap.get(parameter.key)
    if (!declaration) {
      throw new Error(`Parameter declaration '${parameter.key}' not found`)
    }

    return {
      ...parameter,
      ...declaration,
    }
  })

  return {
    ...changeSet,
    parameters,
  }
}

/**
 * @hidden
 */
export const waitChangeSetToBeReady: StackOperationStep<ChangeSetNameHolder> = async (
  state,
) => {
  const {
    stack,
    changeSetName,
    logger,
    currentStack,
    templateSummary,
    transitions,
  } = state
  const changeSet = await stack
    .getCloudFormationClient()
    .waitUntilChangeSetIsReady(stack.name, changeSetName)

  const terminationProtectionChanged = currentStack
    ? currentStack.enableTerminationProtection !== stack.terminationProtection
    : false

  if (changeSet === undefined && !terminationProtectionChanged) {
    logger.debug("Change set contains no changes")
    return transitions.executeAfterDeployHooks({
      ...state,
      message: "No changes",
      status: "SUCCESS",
      events: [],
      success: true,
    })
  }

  const detailedChangeSet = changeSet
    ? enrichChangeSet(changeSet, templateSummary)
    : undefined

  return transitions.reviewChangeSet({ ...state, changeSet: detailedChangeSet })
}
