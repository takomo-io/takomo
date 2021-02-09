import {
  AccountAlias,
  AccountEmail,
  AccountName,
  CreateAccountStatus,
} from "@takomo/aws-model"
import { CommandInput, CommandOutput, ConfirmResult, IO } from "@takomo/core"
import { OrganizationalUnitPath } from "@takomo/organization-model"

export interface CreateAccountInput extends CommandInput {
  readonly email: AccountEmail
  readonly name: AccountName
  readonly iamUserAccessToBilling: boolean
  readonly roleName: string
  readonly alias?: AccountAlias
  readonly ou?: OrganizationalUnitPath
}

export interface CreateAccountOutput extends CommandOutput {
  readonly createAccountStatus?: CreateAccountStatus
}

export interface CreateAccountIO extends IO<CreateAccountOutput> {
  readonly confirmAccountCreation: (
    name: AccountName,
    email: AccountEmail,
    iamUserAccessToBilling: boolean,
    roleName: string,
    alias?: AccountAlias,
    ou?: OrganizationalUnitPath,
  ) => Promise<ConfirmResult>
}
