import { loadOrganizationData } from "../../load"
import { InitialOrganizationDeployContext } from "../../model"
import { LaunchOrganizationOutput } from "./model"
import { validateLocalConfiguration } from "./validate"

export const loadData = async (
  initial: InitialOrganizationDeployContext,
): Promise<LaunchOrganizationOutput> => {
  const { ctx, io, watch } = initial
  const childWatch = watch.startChild("load-organization-data")
  const organizationData = await loadOrganizationData(ctx, io)

  childWatch.stop()

  return validateLocalConfiguration({
    ...initial,
    organizationData,
  })
}
