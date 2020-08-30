import { AccountId, Region, StackPath } from "@takomo/core"
import {
  SecretConfig,
  TemplateBucketConfig,
  TimeoutConfig,
} from "@takomo/stacks-model"
import { Capability } from "aws-sdk/clients/cloudformation"

export const parseTemplateBucket = (
  value: any,
): TemplateBucketConfig | null => {
  if (!value) {
    return null
  }

  const { name, keyPrefix } = value

  return {
    name: name || null,
    keyPrefix: keyPrefix || null,
  }
}

export const parseTimeout = (value: any): TimeoutConfig | null => {
  if (!value) {
    return null
  }

  if (typeof value === "number") {
    return {
      create: value,
      update: value,
    }
  }

  return {
    create: value.create,
    update: value.update,
  }
}

export const parseTags = (value: any): Map<string, string> => {
  if (value === null || value === undefined) {
    return new Map()
  }

  return new Map(
    Object.entries(value).map((e) => {
      const [k, v] = e
      return [k, `${v}`]
    }),
  )
}

export const parseSecrets = (value: any): Map<string, SecretConfig> => {
  if (value === null || value === undefined) {
    return new Map()
  }

  return new Map(
    Object.keys(value).map((name) => {
      const v = value[name]
      const description = v.description
      const secret = {
        name,
        description,
      }

      return [name, secret]
    }),
  )
}

export const parseDepends = (value: any): StackPath[] => {
  if (value === null || value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

export const parseRegions = (value: any): Region[] => {
  if (value === null || value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

export const parseCapabilities = (value: any): Capability[] | null => {
  if (value === null || value === undefined) {
    return null
  }

  return Array.isArray(value) ? value : [value]
}

export const parseAccountIds = (value: any): AccountId[] | null => {
  if (value === null || value === undefined) {
    return null
  }

  return Array.isArray(value)
    ? value.map((a) => a.toString())
    : [value.toString()]
}

export const parseIgnore = (value: any): boolean | null => {
  if (value === null || value === undefined) {
    return null
  }

  return value === true
}

export const parseTerminationProtection = (value: any): boolean | null => {
  if (value === null || value === undefined) {
    return null
  }

  return value === true
}
