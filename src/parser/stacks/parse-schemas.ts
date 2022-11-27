import { SchemaConfig, SchemasConfig } from "../../config/common-config"
import { parseSchema } from "./parse-schema"

const parseSchemaConfig = (value: unknown): ReadonlyArray<SchemaConfig> => {
  if (value === undefined || value === null) {
    return []
  }

  const schemas = Array.isArray(value) ? value : [value]
  return schemas.map((s) => parseSchema(s)!)
}

export const parseSchemas = (value: unknown): SchemasConfig | undefined => {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value !== "object") {
    throw new Error(`Expected schema to be of type string or object`)
  }

  const obj = value as any

  return {
    data: parseSchemaConfig(obj.data),
    tags: parseSchemaConfig(obj.tags),
    name: parseSchemaConfig(obj.name),
    parameters: parseSchemaConfig(obj.parameters),
  }
}
