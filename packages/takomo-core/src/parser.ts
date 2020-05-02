import { TakomoError } from "@takomo/util"
import { CommandRole, Vars } from "./model"

export const parseVars = (value: any): Vars => value || {}

export const parseCommandRole = (value: any): CommandRole | null => {
  if (value === null || value === undefined) {
    return null
  }

  return {
    iamRoleArn: value,
  }
}

export const parseRegex = (path: string, pattern: string): RegExp | null => {
  try {
    return pattern ? new RegExp(pattern) : null
  } catch (e) {
    throw new TakomoError(
      `Invalid regex pattern ${pattern} provided in ${path}`,
    )
  }
}
