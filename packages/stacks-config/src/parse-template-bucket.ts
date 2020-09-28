import { TemplateBucketConfig } from "@takomo/stacks-model"

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
