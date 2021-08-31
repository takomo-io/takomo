import { CommandHandler } from "@takomo/core"
import {
  buildOrganizationContext,
  loadOrganizationState,
  OrganizationConfigRepository,
  OrganizationContext,
} from "@takomo/organization-context"
import { TkmLogger } from "@takomo/util"
import { validateOrganizationConfigIsInSyncWithRemoteState } from "../common/validate-organization-state"
import {
  ListAccountsStacksInput,
  ListAccountsStacksIO,
  ListAccountsStacksOutput,
} from "./model"

export const listAccounts = async (
  ctx: OrganizationContext,
  logger: TkmLogger,
  configRepository: OrganizationConfigRepository,
): Promise<string[]> => {
  const organizationState = await loadOrganizationState(ctx, logger)

  await validateOrganizationConfigIsInSyncWithRemoteState({
    organizationState,
    ctx,
    logger,
    configRepository,
  })

  return []
}

export const listAccountsStacksCommand: CommandHandler<
  OrganizationConfigRepository,
  ListAccountsStacksIO,
  ListAccountsStacksInput,
  ListAccountsStacksOutput
> = async ({
  ctx,
  configRepository,
  io,
  input,
  credentialManager,
}): Promise<ListAccountsStacksOutput> =>
  buildOrganizationContext(ctx, configRepository, io, credentialManager)
    .then((ctx) => listAccounts(ctx, io, configRepository))
    .then((accounts) => {
      const { timer } = input
      timer.stop()
      return {
        accounts,
        success: true,
        message: "Success",
        status: "SUCCESS",
        outputFormat: input.outputFormat,
        timer,
      } as ListAccountsStacksOutput
    })
    .then(io.printOutput)
