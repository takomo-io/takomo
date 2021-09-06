import { ConfigSetInstruction, DEFAULT_STAGE_NAME } from "@takomo/config-sets"

const parseConfigSetInstruction = (value: unknown): ConfigSetInstruction => {
  if (typeof value === "string") {
    return {
      name: value,
      stage: DEFAULT_STAGE_NAME,
    }
  }

  if (typeof value === "object") {
    const o = value as any
    return {
      name: o.name,
      stage: o.stage ?? DEFAULT_STAGE_NAME,
    }
  }

  throw new Error("Expected config set item to be of type object or string")
}

export const parseConfigSetInstructions = (
  value: unknown,
): ReadonlyArray<ConfigSetInstruction> => {
  if (value === null || value === undefined) {
    return []
  }

  if (typeof value === "string") {
    return [parseConfigSetInstruction(value)]
  }

  if (Array.isArray(value)) {
    return value.map(parseConfigSetInstruction)
  }

  return [parseConfigSetInstruction(value)]
}
