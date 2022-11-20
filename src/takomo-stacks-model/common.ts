export interface TimeoutConfig {
  readonly create: number
  readonly update: number
}

export interface TemplateBucketConfig {
  readonly name: string
  readonly keyPrefix?: string
}
