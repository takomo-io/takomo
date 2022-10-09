import {
  AccountArn,
  AccountEmail,
  AccountId,
  AccountName,
  AccountStatus,
} from "./common"

export interface Account {
  readonly id: AccountId
  readonly name: AccountName
  readonly arn: AccountArn
  readonly email: AccountEmail
  readonly status: AccountStatus
}

export type OUId = string
export type OUName = string
export type OUArn = string
export type OUPath = string

export interface OU {
  readonly id: OUId
  readonly name: OUName
  readonly arn: OUArn
  readonly path: OUPath
}
