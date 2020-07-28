import { CommandStatus } from "@takomo/core"
import { confirmDeployment } from "../confirm"
import { DeployOrganizationOutput, OrganizationDataHolder } from "../model"
import { planOrganizationDeploy } from "./plan-organization-deploy"

export const planDeployment = async (
  holder: OrganizationDataHolder,
): Promise<DeployOrganizationOutput> => {
  const { io, watch, ctx, organizationState } = holder
  const childWatch = watch.startChild("plan-deployment")

  io.info("Plan deployment")

  const plan = await planOrganizationDeploy(ctx, organizationState)
  childWatch.stop()

  io.traceObject("Complete plan:", plan)

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
