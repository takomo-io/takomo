import { TagKey } from "../takomo-aws-model"
import { RawTagValue } from "../takomo-stacks-model"

export const parseTags = (value: any): Map<TagKey, RawTagValue> => {
  if (value === null || value === undefined) {
    return new Map()
  }

  return new Map(Object.entries(value).map(([k, v]) => [k, v as RawTagValue]))
}
