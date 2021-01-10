import { TakomoError } from "@takomo/util"
import { StackOperationStep } from "../../common/steps"
import { StackParameterInfo } from "../model"
import { TemplateSummaryHolder } from "../states"

/**
 * @hidden
 */
export class ImmutableParameterError extends TakomoError {
  constructor({ key }: StackParameterInfo) {
    super(
      `Parameter '${key}' is marked as immutable but deploying the stack would update its value.`,
    )
  }
}

/**
 * @hidden
 */
export class ImmutableNoEchoParameterError extends TakomoError {
  constructor({ key }: StackParameterInfo) {
    super(
      `Invalid configuration in parameter '${key}'. Parameter with NoEcho=true can't be marked as immutable.`,
    )
  }
}

export const validateParameters: StackOperationStep<TemplateSummaryHolder> = (
  input,
) => {
  const {
    transitions,
    state,
    parameters,
    currentStack,
    templateSummary,
  } = input

  parameters.forEach((parameter) => {
    const templateParameter = templateSummary.parameters.find(
      (p) => p.key === parameter.key,
    )

    if (!templateParameter) {
      throw new Error(
        `Parameter "${parameter.key}" not found from the template summary`,
      )
    }

    if (parameter.immutable && templateParameter.noEcho) {
      throw new ImmutableNoEchoParameterError(parameter)
    }
  })

  if (currentStack) {
    parameters.forEach((parameter) => {
      const currentParameter = currentStack.parameters.find(
        (p) => p.key === parameter.key,
      )

      if (
        currentParameter &&
        parameter.immutable &&
        currentParameter.value !== parameter.value
      ) {
        throw new ImmutableParameterError(parameter)
      }
    })
  }

  if (state.autoConfirm) {
    return transitions.initiateStackCreateOrUpdate(input)
  }

  return transitions.initiateChangeSetCreate(input)
}
