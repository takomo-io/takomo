import { AccountId, OrganizationAccount } from "@takomo/aws-model"
import { CommandInput, CommandOutput, IO } from "@takomo/core"

export type ListAccountsInput = CommandInput

export interface AccountsList {
  readonly accounts: ReadonlyArray<OrganizationAccount>
  readonly masterAccountId: AccountId
}

export interface ListAccountsOutput extends CommandOutput {
  readonly accounts: ReadonlyArray<OrganizationAccount>
  readonly masterAccountId: AccountId
}

export type ListAccountsIO = IO<ListAccountsOutput>
