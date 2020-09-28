import { Capability } from "aws-sdk/clients/cloudformation"

export const parseCapabilities = (value: any): Capability[] | null => {
  if (value === null || value === undefined) {
    return null
  }

  return Array.isArray(value) ? value : [value]
}
