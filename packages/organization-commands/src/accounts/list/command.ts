import { CommandHandler } from "@takomo/core"
import {
  buildOrganizationContext,
  OrganizationConfigRepository,
} from "@takomo/organization-context"
import { listAccounts } from "./list-accounts"
import { ListAccountsInput, ListAccountsIO, ListAccountsOutput } from "./model"

export const listAccountsCommand: CommandHandler<
  OrganizationConfigRepository,
  ListAccountsIO,
  ListAccountsInput,
  ListAccountsOutput
> = async ({
  ctx,
  configRepository,
  io,
  input,
  credentialManager,
}): Promise<ListAccountsOutput> =>
  buildOrganizationContext(ctx, configRepository, io, credentialManager)
    .then((ctx) => listAccounts(ctx))
    .then(({ accounts, masterAccountId }) => {
      const { timer } = input
      timer.stop()
      return {
        accounts,
        masterAccountId,
        success: true,
        message: "Success",
        status: "SUCCESS",
        outputFormat: input.outputFormat,
        timer,
      } as ListAccountsOutput
    })
    .then(io.printOutput)
