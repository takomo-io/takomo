/**
 * Type representing either a function that returns a value
 * or a constant value.
 */
export type GetterOrConst<T> = () => T | T

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
