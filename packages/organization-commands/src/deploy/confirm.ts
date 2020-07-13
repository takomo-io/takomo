import { CommandStatus } from "@takomo/core"
import { deployBasicConfiguration } from "./deploy/basic-config"
import { DeploymentPlanHolder, DeployOrganizationOutput } from "./model"

export const confirmDeployment = async (
  holder: DeploymentPlanHolder,
): Promise<DeployOrganizationOutput> => {
  const { watch, io, ctx, result } = holder
  const childWatch = watch.startChild("confirm-deployment")
  const options = ctx.getOptions()

  io.debug("Confirm deployment")

  if (options.isAutoConfirmEnabled()) {
    childWatch.stop()
    return deployBasicConfiguration(holder)
  }

  if (result) {
    io.debug("Deploy already completed, skip confirm step")
    childWatch.stop()
    return deployBasicConfiguration(holder)
  }

  const confirmed = await io.confirmLaunch(holder)
  const newResult = confirmed
    ? null
    : { status: CommandStatus.CANCELLED, success: false, message: "Cancelled" }

  return deployBasicConfiguration({
    ...holder,
    result: newResult,
  })
}
