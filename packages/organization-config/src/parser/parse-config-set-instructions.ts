import { ConfigSetInstruction } from "@takomo/config-sets"

export const parseConfigSetInstructions = (
  value: unknown,
): ReadonlyArray<ConfigSetInstruction> => {
  if (value === null || value === undefined) {
    return []
  }

  if (typeof value === "string") {
    return [
      {
        name: value,
      },
    ]
  }

  if (Array.isArray(value)) {
    return value.map((entry) => {
      if (typeof entry === "string") {
        return { name: entry }
      } else if (typeof entry === "object") {
        return entry
      }

      throw new Error(
        "Expected config set items to be of type object or string",
      )
    })
  }

  if (typeof value === "object") {
    return [value as ConfigSetInstruction]
  }

  throw new Error("Expected config sets to be of type object, array or string")
}
