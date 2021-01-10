import { AccountAlias, AccountEmail, AccountName } from "@takomo/aws-model"
import { CommandInput, CommandOutput, ConfirmResult, IO } from "@takomo/core"
import { CreateAccountStatus } from "aws-sdk/clients/organizations"

export interface CreateAccountInput extends CommandInput {
  readonly email: AccountEmail
  readonly name: AccountName
  readonly iamUserAccessToBilling: boolean
  readonly roleName: string
  readonly alias?: AccountAlias
}

export interface CreateAccountOutput extends CommandOutput {
  readonly createAccountStatus: CreateAccountStatus | null
}

export interface CreateAccountIO extends IO<CreateAccountOutput> {
  readonly confirmAccountCreation: (
    name: AccountName,
    email: AccountEmail,
    iamUserAccessToBilling: boolean,
    roleName: string,
    alias?: AccountAlias,
  ) => Promise<ConfirmResult>
}
