import {
  ListParameterConfig,
  ParameterConfig,
  ParameterConfigs,
  SingleParameterConfig,
} from "../../config/common-config.js"
import { parseOptionalBoolean } from "../common-parser.js"
import { parseSchema } from "./parse-schema.js"

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
      schema: undefined,
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
    confidential: parseOptionalBoolean(objValue.confidential),
    immutable: parseImmutable(objValue.immutable),
    schema: parseSchema(objValue.schema),
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
      const confidential = parseOptionalBoolean(objValue.confidential)
      const immutable = parseImmutable(objValue.immutable)
      const items = objValue.value.map(parseParameterConfig)
      const schema = parseSchema(objValue.schema)
      return new ListParameterConfig({ items, confidential, immutable, schema })
    }

    return new SingleParameterConfig(
      parseParameterConfig({
        ...objValue,
        confidential: parseOptionalBoolean(objValue.confidential),
        immutable: parseImmutable(objValue.immutable),
        schema: parseSchema(objValue.schema),
        resolver: "static",
      }),
    )
  }

  return new SingleParameterConfig(parseParameterConfig(objValue))
}
