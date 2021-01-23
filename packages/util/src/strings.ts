import crypto from "crypto"
import R from "ramda"
import stripAnsi from "strip-ansi"

/**
 * @hidden
 */
export const indentLines = (string: string, indent = 2): string => {
  const padding = " ".repeat(indent)
  return string
    .split("\n")
    .map((line) => `${padding}${line}`)
    .join("\n")
}

/**
 * @hidden
 */
export const checksum = (string: string): string =>
  crypto.createHash("sha256").update(string, "utf8").digest("hex")

/**
 * @hidden
 */
export const getStringSizeInBytes = (string: string): number =>
  Buffer.byteLength(string, "utf8")

export type Formatter<T> = (item: T) => string

export type FormatterPadding = "none" | "left" | "right"

export interface FormatterProps<T> {
  readonly items: T[]
  readonly getter: (item: T) => unknown
  readonly padding?: FormatterPadding
  readonly marginLeft?: number
  readonly marginRight?: number
  readonly defaultValue?: string
  readonly maxLength?: number
}

const getPadder = (
  padding: FormatterPadding,
  maxLength: number,
): ((value: string) => string) => {
  switch (padding) {
    case "left":
      return (value) => value.padStart(maxLength)
    case "right":
      return (value) => value.padEnd(maxLength)
    case "none":
      return R.identity
    default:
      throw new Error(`Unsupported padding option: ${padding}`)
  }
}

export const formatter = <T>({
  items,
  getter,
  padding = "none",
  marginLeft = 0,
  marginRight = 0,
  defaultValue = "undefined",
  maxLength,
}: FormatterProps<T>): Formatter<T> => {
  const marginLeftString = " ".repeat(marginLeft)
  const marginRightString = " ".repeat(marginRight)

  const getterFn = (item: T): string => {
    const value = getter(item)
    const stringValue =
      value !== undefined && value !== null ? `${value}` : defaultValue
    return `${marginLeftString}${stringValue}${marginRightString}`
  }

  const evaluatedMaxLength =
    maxLength ??
    R.apply(
      Math.max,
      items
        .map(getterFn)
        .map(stripAnsi)
        .map((s) => s.length),
    )

  const padder = getPadder(padding, evaluatedMaxLength)

  return R.pipe(getterFn, padder)
}
