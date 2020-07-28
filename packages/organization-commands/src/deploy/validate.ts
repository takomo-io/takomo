import { validateCommonLocalConfiguration } from "@takomo/organization-context"
import { DeployOrganizationOutput, OrganizationDataHolder } from "./model"
import { planDeployment } from "./plan/plan-deployment"

export const validateLocalConfiguration = async (
  holder: OrganizationDataHolder,
): Promise<DeployOrganizationOutput> => {
  const {
    ctx,
    io,
    watch,
    organizationState: { accounts },
  } = holder
  const childWatch = watch.startChild("validate-configuration")
  io.info("Validate configuration")

  await validateCommonLocalConfiguration(ctx, accounts)

  childWatch.stop()
  return planDeployment(holder)
}
