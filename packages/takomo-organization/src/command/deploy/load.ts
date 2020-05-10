import { loadOrganizationData } from "../../load"
import { InitialOrganizationDeployContext } from "../../model"
import { DeployOrganizationOutput } from "./model"
import { validateLocalConfiguration } from "./validate"

export const loadData = async (
  initial: InitialOrganizationDeployContext,
): Promise<DeployOrganizationOutput> => {
  const { ctx, io, watch } = initial
  const childWatch = watch.startChild("load-organization-data")
  const organizationData = await loadOrganizationData(ctx, io)

  childWatch.stop()

  return validateLocalConfiguration({
    ...initial,
    organizationData,
  })
}
