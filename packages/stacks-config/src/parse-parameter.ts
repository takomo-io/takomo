import {
  ListParameterConfig,
  ParameterConfig,
  ParameterConfigs,
  SingleParameterConfig,
} from "./model"

const parseConfidential = (value: unknown): boolean | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value !== "boolean") {
    throw new Error("Expected confidential to be boolean")
  }

  return value
}

const parseImmutable = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value !== "boolean") {
    throw new Error("Expected immutable to be boolean")
  }

  return value
}

const parseParameterConfig = (value: unknown): ParameterConfig => {
  if (
    typeof value === "number" ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return {
      confidential: undefined,
      immutable: false,
      resolver: "static",
      value,
    }
  }

  if (typeof value !== "object") {
    throw new Error(
      "Expected parameter value to be an object, string, number or boolean",
    )
  }

  const objValue = value as { [key: string]: unknown }
  const resolver = objValue.resolver ?? "static"

  if (typeof resolver !== "string") {
    throw new Error("Expected resolver to be string")
  }

  return {
    ...objValue,
    resolver,
    confidential: parseConfidential(objValue.confidential),
    immutable: parseImmutable(objValue.immutable),
  }
}

export const parseParameter = (value: unknown): ParameterConfigs => {
  if (value === null || value === undefined) {
    throw new Error("Parameter must not be undefined or null")
  }

  if (
    typeof value === "number" ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return new SingleParameterConfig(parseParameterConfig(value))
  }

  if (Array.isArray(value)) {
    const items = value.map(parseParameterConfig)
    return new ListParameterConfig({ items })
  }

  if (typeof value !== "object") {
    throw new Error(
      "Expected parameter value to be an object, array, string, number or boolean",
    )
  }

  const objValue = value as { [key: string]: unknown }
  if (objValue.resolver === undefined) {
    if (objValue.value === undefined) {
      throw new Error("Expected value to be defined")
    }

    if (Array.isArray(objValue.value)) {
      const confidential = parseConfidential(objValue.confidential)
      const immutable = parseImmutable(objValue.immutable)
      const items = objValue.value.map(parseParameterConfig)
      return new ListParameterConfig({ items, confidential, immutable })
    }

    return new SingleParameterConfig(
      parseParameterConfig({
        ...objValue,
        confidential: parseConfidential(objValue.confidential),
        immutable: parseImmutable(objValue.immutable),
        resolver: "static",
      }),
    )
  }

  return new SingleParameterConfig(parseParameterConfig(objValue))
}
