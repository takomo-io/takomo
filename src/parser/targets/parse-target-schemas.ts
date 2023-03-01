import { SchemaConfig } from "../../config/targets-config.js"

export const parseTargetSchema = (value: unknown): SchemaConfig => {
  if (typeof value === "string") {
    return {
      name: value,
    }
  }

  if (typeof value === "object") {
    return value as SchemaConfig
  }

  throw new Error(`Expected schema to be of type string or object`)
}

export const parseTargetSchemas = (
  value: unknown,
): ReadonlyArray<SchemaConfig> => {
  if (value === undefined || value === null) {
    return []
  }

  return Array.isArray(value)
    ? value.map(parseTargetSchema)
    : [parseTargetSchema(value)]
}
