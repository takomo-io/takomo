import { CommandStatus } from "@takomo/core"
import { DeploymentTargetsOperationOutput, PlanHolder } from "./model"
import { processOperation } from "./process"

export const confirmOperation = async (
  holder: PlanHolder,
): Promise<DeploymentTargetsOperationOutput> => {
  const { io, input, watch, plan } = holder
  const { options } = input

  if (!options.isAutoConfirmEnabled() && !(await io.confirmOperation(plan))) {
    return {
      results: [],
      message: "Cancelled",
      status: CommandStatus.CANCELLED,
      success: false,
      watch: watch.stop(),
    }
  }

  return processOperation(holder)
}
