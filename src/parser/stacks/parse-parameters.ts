import { ParameterConfigs } from "../../config/common-config"
import { StackParameterKey } from "../../takomo-aws-model"
import { parseParameter } from "./parse-parameter"

export const parseParameters = (
  value: unknown,
): Map<StackParameterKey, ParameterConfigs> => {
  if (value === null || value === undefined) {
    return new Map()
  }

  if (typeof value !== "object") {
    throw new Error("Expected parameters to be an object")
  }

  const valueObj = value as { [key: string]: unknown }

  return new Map(
    Object.entries(valueObj).map(([parameterName, parameterConfig]) => {
      return [parameterName, parseParameter(parameterConfig)]
    }),
  )
}
