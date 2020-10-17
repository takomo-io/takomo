import {
  AccountId,
  CommandInput,
  CommandOutput,
  ConfirmResult,
  IO,
} from "@takomo/core"

export interface CreateAccountAliasInput extends CommandInput {
  readonly accountId: AccountId
  readonly alias: string
}

export type CreateAccountAliasOutput = CommandOutput

export interface CreateAccountAliasIO extends IO {
  confirmCreateAlias: (
    accountId: AccountId,
    alias: string,
  ) => Promise<ConfirmResult>

  printOutput: (output: CreateAccountAliasOutput) => CreateAccountAliasOutput
}
