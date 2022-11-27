import { RawTagValue } from "../../stacks/stack"
import { TagKey } from "../../takomo-aws-model"

export const parseTags = (value: any): Map<TagKey, RawTagValue> => {
  if (value === null || value === undefined) {
    return new Map()
  }

  return new Map(Object.entries(value).map(([k, v]) => [k, v as RawTagValue]))
}
