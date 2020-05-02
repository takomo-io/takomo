import { loadOrganizationData } from "../../../load"
import { AccountsOperationOutput, InitialLaunchAccountsContext } from "./model"
import { validateLocalConfiguration } from "./validate"

export const loadData = async (
  initial: InitialLaunchAccountsContext,
): Promise<AccountsOperationOutput> => {
  const { ctx, io, watch } = initial
  const childWatch = watch.startChild("load-data")
  const organizationData = await loadOrganizationData(ctx, io)

  childWatch.stop()

  return validateLocalConfiguration({
    ...initial,
    organizationData,
  })
}
