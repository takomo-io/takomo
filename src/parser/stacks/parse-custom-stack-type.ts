import { CustomStackType } from "../../stacks/stack.js"

export const parseCustomStackType = (value: unknown): CustomStackType => {
  if (value === null || value === undefined) {
    throw new Error(`Custom stack type must be defined`)
  }

  if (typeof value !== "string") {
    throw new Error(
      `Invalid custom stack type: expected a string but got: ${typeof value}`,
    )
  }

  return value as CustomStackType
}
