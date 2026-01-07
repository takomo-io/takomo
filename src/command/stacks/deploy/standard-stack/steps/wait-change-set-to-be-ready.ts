import {
  ALLOW_ALL_STACK_POLICY,
  ChangeSet,
  DetailedChangeSet,
  DetailedCloudFormationStack,
  TemplateSummary,
} from "../../../../../aws/cloudformation/model.js"
import { InternalStandardStack } from "../../../../../stacks/standard-stack.js"
import { arrayToMap } from "../../../../../utils/collections.js"
import { TakomoError } from "../../../../../utils/errors.js"
import { prettyPrintJson } from "../../../../../utils/json.js"
import { indentLines } from "../../../../../utils/strings.js"
import { StackOperationStep } from "../../../common/steps.js"
import { ChangeSetNameHolder } from "../states.js"

class UnexpectedChangesInStackError extends TakomoError {
  constructor(
    changeSet: ChangeSet | undefined,
    terminationProtectionChanged: boolean,
    stackPolicyChanged: boolean,
  ) {
    let message = "Stack has unexpected changes:\n\n"
    if (terminationProtectionChanged) {
      message += "- termination protection was changed\n\n"
    }
    if (stackPolicyChanged) {
      message += "- stack policy was changed\n\n"
    }
    if (changeSet) {
      message += `- Change set:\n\n${indentLines(
        JSON.stringify(changeSet, undefined, 2),
      )}`
    }

    super(message)
  }
}

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
  stack: InternalStandardStack,
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

export const waitChangeSetToBeReady: StackOperationStep<
  ChangeSetNameHolder
> = async (state) => {
  const {
    stack,
    changeSetName,
    logger,
    currentStack,
    templateSummary,
    transitions,
    expectNoChanges,
  } = state
  const client = await stack.getCloudFormationClient()
  const changeSet = await client.waitUntilChangeSetIsReady(
    stack.name,
    changeSetName,
  )

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

  if (expectNoChanges) {
    return transitions.failStackOperation({
      ...state,
      message: "Stack has unexpected changes",
      events: [],
      error: new UnexpectedChangesInStackError(
        changeSet,
        terminationProtectionChanged,
        stackPolicyChanged,
      ),
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
