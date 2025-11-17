import { CustomStackType } from "../../stacks/stack.js"

export const parseCustomStackType = (
  value: unknown,
): CustomStackType | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value !== "string") {
    throw new Error(
      `Invalid custom stack type: expected a string but got: ${typeof value}`,
    )
  }

  return value as CustomStackType
}
