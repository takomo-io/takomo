import { TakomoError } from "@takomo/util"
import { CommandRole } from "./command"
import { Vars } from "./variables"

/**
 * @hidden
 */
export const parseVars = (value: any): Vars => value || {}

/**
 * @hidden
 */
export const parseCommandRole = (value: any): CommandRole | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  return {
    iamRoleArn: value,
  }
}

/**
 * @hidden
 */
export const parseRegex = (
  path: string,
  pattern?: string,
): RegExp | undefined => {
  try {
    return pattern ? new RegExp(pattern) : undefined
  } catch (e) {
    throw new TakomoError(
      `Invalid regex pattern ${pattern} provided in ${path}`,
    )
  }
}
