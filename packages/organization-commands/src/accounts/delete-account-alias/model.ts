import { AccountId } from "@takomo/aws-model"
import { CommandInput, CommandOutput, ConfirmResult, IO } from "@takomo/core"

export interface DeleteAccountAliasInput extends CommandInput {
  readonly accountId: AccountId
}

export type DeleteAccountAliasOutput = CommandOutput

export interface DeleteAccountAliasIO extends IO<DeleteAccountAliasOutput> {
  readonly confirmDeleteAlias: (accountId: AccountId) => Promise<ConfirmResult>
}
