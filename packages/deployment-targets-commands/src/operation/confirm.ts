import { DeploymentTargetsOperationOutput, PlanHolder } from "./model"
import { processOperation } from "./process"

/**
 * @hidden
 */
export const confirmOperation = async (
  holder: PlanHolder,
): Promise<DeploymentTargetsOperationOutput> => {
  const { io, timer, plan, ctx } = holder

  if (!ctx.autoConfirmEnabled && !(await io.confirmOperation(plan))) {
    timer.stop()
    return {
      results: [],
      message: "Cancelled",
      status: "CANCELLED",
      success: false,
      timer,
    }
  }

  return processOperation(holder)
}
