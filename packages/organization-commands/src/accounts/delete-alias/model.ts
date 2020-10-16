import {
  AccountId,
  CommandInput,
  CommandOutput,
  ConfirmResult,
  IO,
} from "@takomo/core"

export interface DeleteAliasInput extends CommandInput {
  readonly accountId: AccountId
}

export type DeleteAliasOutput = CommandOutput

export interface DeleteAliasIO extends IO {
  confirmDeleteAlias: (accountId: AccountId) => Promise<ConfirmResult>

  printOutput: (output: DeleteAliasOutput) => DeleteAliasOutput
}
