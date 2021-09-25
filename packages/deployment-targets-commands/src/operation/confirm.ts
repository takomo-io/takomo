import { DeploymentTargetsOperationOutput, PlanHolder } from "./model"
import { processOperation } from "./process"

export const confirmOperation = async (
  holder: PlanHolder,
): Promise<DeploymentTargetsOperationOutput> => {
  const { io, timer, plan, ctx, input } = holder

  if (ctx.autoConfirmEnabled) {
    return processOperation(holder)
  }

  const answer = await io.confirmOperation(plan)
  switch (answer) {
    case "CANCEL":
      timer.stop()
      return {
        results: [],
        outputFormat: input.outputFormat,
        message: "Cancelled",
        status: "CANCELLED",
        success: false,
        timer,
      }
    case "CONTINUE_AND_REVIEW":
      return processOperation({
        ...holder,
        input: { ...holder.input, concurrentTargets: 1 },
      })
    case "CONTINUE_NO_REVIEW":
      return processOperation({
        ...holder,
        ctx: {
          ...holder.ctx,
          autoConfirmEnabled: true,
          commandContext: {
            ...holder.ctx.commandContext,
            autoConfirmEnabled: true,
          },
        },
      })
    default:
      throw new Error(`Unknown answer '${answer}'`)
  }
}
