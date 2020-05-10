import { CommandStatus } from "@takomo/core"
import { OrganizationDataHolder } from "../../model"
import { planOrganizationLaunch } from "../../plan"
import { confirmDeployment } from "./confirm"
import { DeployOrganizationOutput } from "./model"

export const planDeployment = async (
  holder: OrganizationDataHolder,
): Promise<DeployOrganizationOutput> => {
  const { io, watch, ctx, organizationData } = holder
  const childWatch = watch.startChild("plan-deployment")

  io.info("Plan deployment")

  const plan = await planOrganizationLaunch(ctx, organizationData)
  childWatch.stop()

  if (!plan.hasChanges) {
    io.info("Deployment plan has no changes")
    return confirmDeployment({
      ...holder,
      plan,
      result: {
        status: CommandStatus.SKIPPED,
        success: true,
        message: "No changes",
      },
    })
  }

  return confirmDeployment({
    ...holder,
    plan,
  })
}
