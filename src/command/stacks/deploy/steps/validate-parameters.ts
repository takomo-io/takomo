import * as R from "ramda"
import { Schemas } from "../../../../takomo-stacks-model/schemas.js"
import { arrayToObject } from "../../../../utils/collections.js"
import { TakomoError } from "../../../../utils/errors.js"
import { StackOperationStep } from "../../common/steps.js"
import { resolveResultMessage } from "../common.js"
import { StackParameterInfo } from "../model.js"
import { TemplateSummaryHolder } from "../states.js"

export class ImmutableParameterError extends TakomoError {
  constructor({ key }: StackParameterInfo) {
    super(
      `Parameter '${key}' is marked as immutable but deploying the stack would update its value.`,
    )
  }
}

export class ImmutableNoEchoParameterError extends TakomoError {
  constructor({ key }: StackParameterInfo) {
    super(
      `Invalid configuration in parameter '${key}'. Parameter with NoEcho=true can't be marked as immutable.`,
    )
  }
}

const validateParameterSchemas = (
  parameters: ReadonlyArray<StackParameterInfo>,
  schemas?: Schemas,
): ReadonlyArray<string> => {
  const validationErrors = parameters.reduce((collected, parameter) => {
    if (parameter.schema) {
      const { error } = parameter.schema.validate(parameter.value, {
        abortEarly: false,
        convert: false,
      })

      if (error) {
        return [...collected, ...error.details.map((d) => d.message)]
      }
    }

    return collected
  }, new Array<string>())

  if (!schemas) {
    return validationErrors
  }

  const paramsObject = arrayToObject(parameters, R.prop("key"), R.prop("value"))

  return schemas.parameters.reduce((collected, schema) => {
    const { error } = schema.validate(paramsObject, {
      abortEarly: false,
      convert: false,
    })
    if (error) {
      return [...collected, ...error.details.map((d) => d.message)]
    }

    return collected
  }, validationErrors)
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
    stack,
    expectNoChanges,
    emit,
    skipParameters,
  } = input

  if (!skipParameters) {
    parameters.forEach((parameter) => {
      const templateParameter = templateSummary.parameters.find(
        (p) => p.key === parameter.key,
      )

      if (!templateParameter) {
        throw new TakomoError(
          `Parameter '${parameter.key}' is defined in the stack configuration but not found from the template`,
        )
      }

      if (parameter.immutable && templateParameter.noEcho) {
        throw new ImmutableNoEchoParameterError(parameter)
      }
    })

    templateSummary.parameters
      .filter((p) => p.defaultValue === undefined)
      .forEach((templateParameter) => {
        if (!parameters.some((p) => p.key === templateParameter.key)) {
          throw new TakomoError(
            `Parameter '${templateParameter.key}' is defined in the template but not found from the stack configuration`,
          )
        }
      })

    const validationErrors = validateParameterSchemas(parameters, stack.schemas)

    if (validationErrors.length > 0) {
      const message = validationErrors.map((e) => `  - ${e}`).join("\n")
      const error = new TakomoError(
        `Validation errors in stack parameters:\n${message}`,
      )

      return transitions.executeAfterDeployHooks({
        events: [],
        ...input,
        error,
        success: false,
        status: "FAILED",
        message: resolveResultMessage(input.operationType, false),
      })
    }

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
  }

  if (emit) {
    return transitions.emitStackTemplate(input)
  }

  if (state.autoConfirm && !expectNoChanges) {
    return transitions.initiateStackCreateOrUpdate(input)
  }

  return transitions.initiateChangeSetCreate(input)
}
