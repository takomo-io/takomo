import { CommandStatus } from "@takomo/core"
import { DeploymentPlanHolder } from "../../model"
import { deployBasicConfiguration } from "./deploy/basic-config"
import { LaunchOrganizationOutput } from "./model"

export const confirmDeployment = async (
  holder: DeploymentPlanHolder,
): Promise<LaunchOrganizationOutput> => {
  const { watch, io, ctx, result } = holder
  const childWatch = watch.startChild("confirm-deployment")
  const options = ctx.getOptions()

  io.debug("Confirm deployment")

  if (options.isAutoConfirmEnabled()) {
    childWatch.stop()
    return deployBasicConfiguration(holder)
  }

  if (result) {
    io.debug("Launch already completed, skip confirm step")
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
