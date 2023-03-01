import { StackPolicyBody } from "../../aws/cloudformation/model.js"
import { prettyPrintJson, toPrettyJson } from "../../utils/json.js"

export const parseStackPolicy = (value: any): StackPolicyBody | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === "string") {
    return prettyPrintJson(value)
  }

  return toPrettyJson(value)
}
