import { AccountAlias, AccountId } from "@takomo/aws-model"
import { CommandInput, CommandOutput, ConfirmResult, IO } from "@takomo/core"

export interface CreateAccountAliasInput extends CommandInput {
  readonly accountId: AccountId
  readonly alias: AccountAlias
}

export type CreateAccountAliasOutput = CommandOutput

export interface CreateAccountAliasIO extends IO<CreateAccountAliasOutput> {
  readonly confirmCreateAlias: (
    accountId: AccountId,
    alias: AccountAlias,
  ) => Promise<ConfirmResult>
}
