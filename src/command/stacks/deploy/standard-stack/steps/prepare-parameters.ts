import { StackOperationStep } from "../../../common/steps.js"
import { DetailedCurrentStackHolder } from "../states.js"
import { redactConfidentialValue } from "../../../../../utils/confidential.js"

export const prepareParameters: StackOperationStep<
  DetailedCurrentStackHolder
> = async (state: DetailedCurrentStackHolder) => {
  const { stack, ctx, logger, transitions, variables, skipParameters } = state

  if (skipParameters) {
    logger.info("Skip parameters")
    return transitions.prepareTags({ ...state, parameters: [] })
  }

  const logConfidentialInfo = ctx.confidentialValuesLoggingEnabled

  const parameters = await Promise.all(
    Array.from(stack.parameters.entries()).map(
      async ([parameterName, executor]) => {
        const value = await executor.resolve({
          ctx,
          stack,
          parameterName,
          variables,
          listParameterIndex: 0,
          logger: logger.childLogger(`param:${parameterName}`),
        })

        const loggedValue = redactConfidentialValue(
          value,
          executor.isConfidential(),
          logConfidentialInfo,
        )

        logger.debugObject("Parameter:", () => ({
          name: parameterName,
          value: loggedValue,
          resolver: executor.getName(),
          confidential: executor.isConfidential(),
          immutable: executor.isImmutable(),
        }))

        const parameterValue = Array.isArray(value)
          ? value.map((v) => `${v}`).join(",")
          : `${value}`

        const schema = executor.getSchema()

        return {
          schema: schema?.label(parameterName),
          key: parameterName,
          value: parameterValue,
          immutable: executor.isImmutable(),
        }
      },
    ),
  )

  return transitions.prepareTags({ ...state, parameters })
}
