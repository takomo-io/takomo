import { TemplateBucketConfig } from "../../common/model.js"

export const parseTemplateBucket = (
  value: any,
): TemplateBucketConfig | undefined => {
  if (!value) {
    return undefined
  }

  const { name, keyPrefix } = value

  return {
    name: name,
    keyPrefix: keyPrefix,
  }
}
