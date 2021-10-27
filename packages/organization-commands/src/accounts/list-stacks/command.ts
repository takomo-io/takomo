import { CommandHandler } from "@takomo/core"
import { executeConfigSetPlan } from "@takomo/execution-plans"
import {
  buildOrganizationContext,
  loadOrganizationState,
  OrganizationConfigRepository,
  OrganizationContext,
} from "@takomo/organization-context"
import { createAccountsPlan } from "../common/plan"
import { validateOrganizationConfigIsInSyncWithRemoteState } from "../common/validate-organization-state"
import { createExecutor } from "./executor"
import {
  ListAccountsStacksInput,
  ListAccountsStacksIO,
  ListAccountsStacksOutput,
} from "./model"

const listAccountsStacks = async (
  ctx: OrganizationContext,
  io: ListAccountsStacksIO,
  configRepository: OrganizationConfigRepository,
  input: ListAccountsStacksInput,
): Promise<ListAccountsStacksOutput> => {
  const organizationState = await loadOrganizationState(ctx, io)

  await validateOrganizationConfigIsInSyncWithRemoteState({
    organizationState,
    ctx,
    logger: io,
    configRepository,
  })

  const plan = await createAccountsPlan({
    ctx,
    organizationState,
    logger: io,
    accountsSelectionCriteria: input,
  })

  const executor = createExecutor({
    ctx,
    io,
    configRepository,
    outputFormat: input.outputFormat,
  })

  return executeConfigSetPlan({
    plan,
    ctx,
    executor,
    logger: io,
    timer: input.timer,
    state: { failed: false },
    concurrentTargets: input.concurrentAccounts,
    defaultCredentialManager: ctx.credentialManager,
    targetListenerProvider: io.createTargetListener,
  })
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
    .then(io.printOutput)
