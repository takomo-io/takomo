import {
  AccountId,
  CommandInput,
  CommandOutput,
  ConfirmResult,
  IO,
} from "@takomo/core"

export interface DeleteAccountAliasInput extends CommandInput {
  readonly accountId: AccountId
}

export type DeleteAccountAliasOutput = CommandOutput

export interface DeleteAccountAliasIO extends IO {
  confirmDeleteAlias: (accountId: AccountId) => Promise<ConfirmResult>

  printOutput: (output: DeleteAccountAliasOutput) => DeleteAccountAliasOutput
}
