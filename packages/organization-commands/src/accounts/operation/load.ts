import { loadOrganizationState } from "@takomo/organization-context"
import { AccountsOperationOutput, InitialLaunchAccountsContext } from "./model"
import { validateLocalConfiguration } from "./validate"

export const loadData = async (
  initial: InitialLaunchAccountsContext,
): Promise<AccountsOperationOutput> => {
  const { ctx, io, watch } = initial
  const childWatch = watch.startChild("load-data")
  const organizationState = await loadOrganizationState(ctx, io)

  childWatch.stop()

  return validateLocalConfiguration({
    ...initial,
    organizationState,
  })
}
