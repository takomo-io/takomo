import { IamRoleArn } from "../takomo-aws-model"
import { TakomoError } from "../utils/errors"
import { CommandRole } from "./command"
import { Vars } from "./variables"

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
  } catch (e) {
    throw new TakomoError(
      `Invalid regex pattern ${pattern} provided in ${path}`,
    )
  }
}

export const parseVars = (value: any): Vars => value ?? {}

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
