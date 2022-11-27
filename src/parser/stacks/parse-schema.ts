import { SchemaConfig } from "../../config/common-config"

export const parseSchema = (value: unknown): SchemaConfig | undefined => {
  if (value === undefined || value === null) {
    return undefined
  }

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
