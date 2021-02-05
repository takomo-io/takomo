import { StackOperationStep } from "../../common/steps"
import { DetailedCurrentStackHolder } from "../states"

const getValueForLog = (
  value: unknown,
  confidential: boolean,
  logConfidentialInfo: boolean,
): unknown => {
  if (!confidential) {
    return value
  }
  return logConfidentialInfo ? value : "*****"
}

/**
 * @hidden
 */
export const prepareParameters: StackOperationStep<DetailedCurrentStackHolder> = async (
  state: DetailedCurrentStackHolder,
) => {
  const { stack, ctx, logger, transitions } = state
  const logConfidentialInfo = ctx.confidentialValuesLoggingEnabled

  const parameters = await Promise.all(
    Array.from(stack.parameters.entries()).map(
      async ([parameterName, executor]) => {
        const value = await executor.resolve({
          ctx,
          stack,
          parameterName,
          listParameterIndex: 0,
          logger: logger.childLogger(stack.path),
        })

        const loggedValue = getValueForLog(
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
