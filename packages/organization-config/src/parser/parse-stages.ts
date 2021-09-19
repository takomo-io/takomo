import { DEFAULT_STAGE_NAME, StageName } from "@takomo/config-sets"
import { parseOptionalStringArray } from "@takomo/core"

export const parseStages = (value: any): ReadonlyArray<StageName> => {
  if (value === undefined || value === null) {
    return [DEFAULT_STAGE_NAME]
  }

  const stages = parseOptionalStringArray(value) ?? [DEFAULT_STAGE_NAME]
  return stages.includes(DEFAULT_STAGE_NAME)
    ? stages
    : [...stages, DEFAULT_STAGE_NAME]
}
