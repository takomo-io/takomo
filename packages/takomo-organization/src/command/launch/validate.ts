import { OrganizationDataHolder } from "../../model"
import { validateCommonLocalConfiguration } from "../../validation"
import { LaunchOrganizationOutput } from "./model"
import { planDeployment } from "./plan"

export const validateLocalConfiguration = async (
  holder: OrganizationDataHolder,
): Promise<LaunchOrganizationOutput> => {
  const { ctx, io, watch, organizationData } = holder
  const childWatch = watch.startChild("validate-configuration")
  io.info("Validate configuration")

  await validateCommonLocalConfiguration(ctx, organizationData.currentAccounts)

  childWatch.stop()
  return planDeployment(holder)
}
