/**
 * Type representing either a function that returns a value
 * or a constant value.
 */
export type GetterOrConst<T> = () => T | T

/**
 * @hidden
 */
export const getValue = <T>(defaultValue: T, value?: GetterOrConst<T>): T => {
  if (value === undefined) {
    return defaultValue
  }

  if (typeof value === "function") {
    return value()
  }

  return value
}

/**
 * @hidden
 */
export interface TimeoutConfig {
  readonly create: number
  readonly update: number
}

/**
 * @hidden
 */
export interface TemplateBucketConfig {
  readonly name: string
  readonly keyPrefix?: string
}
