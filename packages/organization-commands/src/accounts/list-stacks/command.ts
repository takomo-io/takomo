import { CommandHandler } from "@takomo/core"
import {
  buildOrganizationContext,
  loadOrganizationState,
  OrganizationConfigRepository,
  OrganizationContext,
} from "@takomo/organization-context"
import { TkmLogger } from "@takomo/util"
import { createAccountsPlan } from "../common/plan"
import { validateOrganizationConfigIsInSyncWithRemoteState } from "../common/validate-organization-state"
import {
  ListAccountsStacksInput,
  ListAccountsStacksIO,
  ListAccountsStacksOutput,
} from "./model"

const listAccountsStacks = async (
  ctx: OrganizationContext,
  logger: TkmLogger,
  configRepository: OrganizationConfigRepository,
  input: ListAccountsStacksInput,
): Promise<string[]> => {
  const organizationState = await loadOrganizationState(ctx, logger)

  await validateOrganizationConfigIsInSyncWithRemoteState({
    organizationState,
    ctx,
    logger,
    configRepository,
  })

  const plan = await createAccountsPlan({
    ctx,
    organizationState,
    logger,
    accountsSelectionCriteria: input,
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
    .then((ctx) => listAccountsStacks(ctx, io, configRepository, input))
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
