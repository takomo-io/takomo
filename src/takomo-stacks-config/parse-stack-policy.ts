import { StackPolicyBody } from "../takomo-aws-model"
import { prettyPrintJson, toPrettyJson } from "../takomo-util"

export const parseStackPolicy = (value: any): StackPolicyBody | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === "string") {
    return prettyPrintJson(value)
  }

  return toPrettyJson(value)
}
