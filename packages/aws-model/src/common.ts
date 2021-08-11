export type ClientRequestToken = string
export type TagKey = string
export type TagValue = string

export interface Tag {
  readonly value: TagValue
  readonly key: TagKey
}

/**
 * AWS region
 */
export type Region = string

/**
 * AWS account id
 */
export type AccountId = string

/**
 * AWS user id
 */
export type UserId = string

/**
 * IAM role arn
 */
export type IamRoleArn = string
export type IamRoleName = string

export type AccountAlias = string
export type AccountEmail = string
export type AccountArn = string
export type AccountName = string

export type ServicePrincipal = string
export type Arn = string
