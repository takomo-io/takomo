import { StackPolicyBody } from "../../aws/cloudformation/model"
import { prettyPrintJson, toPrettyJson } from "../../utils/json"

export const parseStackPolicy = (value: any): StackPolicyBody | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === "string") {
    return prettyPrintJson(value)
  }

  return toPrettyJson(value)
}
