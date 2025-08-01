import { IamRoleArn } from "../aws/common/model.js"
import { Vars } from "../common/model.js"
import { CommandRole } from "../takomo-core/command.js"
import { TakomoError } from "../utils/errors.js"

const parse = <T>(
  value: unknown,
  onUndefined: () => T,
  parser: (value: unknown) => T,
): T => (value === undefined || value === null ? onUndefined() : parser(value))

/**
 * Accepts a string or an array of strings and returns an array.
 */
export const parseStringArray = <T extends string>(
  value: unknown,
): ReadonlyArray<T> =>
  parse(
    value,
    () => [],
    (value) => {
      if (typeof value === "string") {
        return [value as T]
      }

      if (Array.isArray(value)) {
        return value
      }

      throw new Error(`Expected value to be an array but got ${typeof value}`)
    },
  )

/**
 * Accepts a string or an array of strings and returns an array.
 */
export const parseOptionalStringArray = <T extends string>(
  value: unknown,
): ReadonlyArray<T> | undefined =>
  parse(
    value,
    () => undefined,
    (value) => {
      if (typeof value === "string") {
        return [value as T]
      }

      if (Array.isArray(value)) {
        return value
      }

      throw new Error(`Expected value to be an array but got ${typeof value}`)
    },
  )

/**
 * Accepts a string or an array of strings and returns a typed array.
 */
export const parseTypedArrayFromString = <T>(
  value: unknown,
): ReadonlyArray<T> =>
  parse(
    value,
    () => [],
    (value) => {
      if (typeof value === "string") {
        return [value as unknown as T]
      }

      if (Array.isArray(value)) {
        return value
      }

      throw new Error(`Expected value to be an array but got ${typeof value}`)
    },
  )

export const parseOptionalString = (value: unknown): string | undefined =>
  parse(
    value,
    () => undefined,
    (value: unknown) => {
      if (typeof value === "string") {
        return value
      }

      throw new Error("Expected string")
    },
  )

export const parseString = (value: unknown, defaultValue: string): string =>
  parse(
    value,
    () => defaultValue,
    (value: unknown) => {
      if (typeof value === "string") {
        return value
      }

      throw new Error("Expected string")
    },
  )

export const parseRegex = (
  path: string,
  pattern?: string,
): RegExp | undefined => {
  try {
    return pattern ? new RegExp(pattern) : undefined
  } catch {
    throw new TakomoError(
      `Invalid regex pattern ${pattern} provided in ${path}`,
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseVars = (value: any): Vars => value ?? {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseCommandRole = (value: any): CommandRole | undefined =>
  parse(
    value,
    () => undefined,
    (value) => ({
      iamRoleArn: value as IamRoleArn,
    }),
  )

export const parseOptionalBoolean = (value: unknown): boolean | undefined =>
  parse(
    value,
    () => undefined,
    (value) => value === true,
  )

export const parseBoolean = (value: unknown, defaultValue: boolean): boolean =>
  parse(
    value,
    () => defaultValue,
    (value) => value === true,
  )
