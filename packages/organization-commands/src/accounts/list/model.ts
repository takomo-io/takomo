import { AccountId, CommandInput, CommandOutput, IO } from "@takomo/core"
import { Account } from "aws-sdk/clients/organizations"

export type ListAccountsInput = CommandInput

export interface AccountsList {
  readonly accounts: Account[]
  readonly masterAccountId: AccountId
}

export interface ListAccountsOutput extends CommandOutput {
  readonly accounts: Account[]
  readonly masterAccountId: AccountId
}

export interface ListAccountsIO extends IO {
  printOutput(output: ListAccountsOutput): ListAccountsOutput
}
