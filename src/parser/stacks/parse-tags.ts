import { TagKey } from "../../aws/common/model"
import { RawTagValue } from "../../stacks/stack"

export const parseTags = (value: any): Map<TagKey, RawTagValue> => {
  if (value === null || value === undefined) {
    return new Map()
  }

  return new Map(Object.entries(value).map(([k, v]) => [k, v as RawTagValue]))
}
