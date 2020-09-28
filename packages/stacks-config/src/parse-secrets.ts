import { SecretConfig } from "@takomo/stacks-model"

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
