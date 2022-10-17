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
