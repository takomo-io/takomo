import { TagKey, TagValue } from "@takomo/aws-model"

export const parseTags = (value: any): Map<TagKey, TagValue> => {
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
