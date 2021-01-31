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
export type Region =
  | "af-south-1"
  | "ap-east-1"
  | "ap-northeast-1"
  | "ap-northeast-2"
  | "ap-northeast-3"
  | "ap-south-1"
  | "ap-southeast-1"
  | "ap-southeast-2"
  | "ca-central-1"
  | "cn-north-1"
  | "cn-northwest-1"
  | "eu-central-1"
  | "eu-north-1"
  | "eu-south-1"
  | "eu-west-1"
  | "eu-west-2"
  | "eu-west-3"
  | "me-south-1"
  | "sa-east-1"
  | "us-east-1"
  | "us-east-2"
  | "us-gov-east-1"
  | "us-west-1"
  | "us-west-2"

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

export type AccountAlias = string
export type AccountEmail = string
export type AccountArn = string
export type AccountName = string

export type ServicePrincipal = string
export type Arn = string
