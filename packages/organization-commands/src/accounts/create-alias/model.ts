import {
  AccountId,
  CommandInput,
  CommandOutput,
  ConfirmResult,
  IO,
} from "@takomo/core"

export interface CreateAliasInput extends CommandInput {
  readonly accountId: AccountId
  readonly alias: string
}

export type CreateAliasOutput = CommandOutput

export interface CreateAliasIO extends IO {
  confirmCreateAlias: (
    accountId: AccountId,
    alias: string,
  ) => Promise<ConfirmResult>

  printOutput: (output: CreateAliasOutput) => CreateAliasOutput
}
