import {
  ALLOW_ALL_STACK_POLICY,
  ChangeSet,
  DetailedChangeSet,
  DetailedCloudFormationStack,
  TemplateSummary,
} from "@takomo/aws-model"
import { InternalStack } from "@takomo/stacks-model"
import { arrayToMap, prettyPrintJson } from "@takomo/util"
import { StackOperationStep } from "../../common/steps"
import { ChangeSetNameHolder } from "../states"

const enrichChangeSet = (
  changeSet: ChangeSet,
  templateSummary: TemplateSummary,
): DetailedChangeSet => {
  const declarationMap = arrayToMap(templateSummary.parameters, (p) => p.key)

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

const hasStackPolicyChanged = (
  stack: InternalStack,
  currentStack?: DetailedCloudFormationStack,
): boolean => {
  if (!currentStack && stack.stackPolicy) {
    return true
  }

  if (!currentStack && !stack.stackPolicy) {
    return false
  }

  if (currentStack!.stackPolicyBody && !stack.stackPolicy) {
    const reformattedCurrent = prettyPrintJson(currentStack!.stackPolicyBody)
    const reformattedAllowAll = prettyPrintJson(ALLOW_ALL_STACK_POLICY)
    if (reformattedCurrent === reformattedAllowAll) {
      return false
    }
  }

  return currentStack?.stackPolicyBody !== stack.stackPolicy
}

/**
 * @hidden
 */
export const waitChangeSetToBeReady: StackOperationStep<ChangeSetNameHolder> =
  async (state) => {
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

    const stackPolicyChanged = hasStackPolicyChanged(stack, currentStack)

    if (
      changeSet === undefined &&
      !terminationProtectionChanged &&
      !stackPolicyChanged
    ) {
      logger.info("Change set contains no changes")
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

    return transitions.reviewChangeSet({
      ...state,
      changeSet: detailedChangeSet,
    })
  }
