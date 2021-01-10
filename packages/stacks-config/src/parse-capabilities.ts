import { StackCapability } from "@takomo/aws-model"

export const parseCapabilities = (
  value: any,
): ReadonlyArray<StackCapability> | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  return Array.isArray(value) ? value : [value]
}
