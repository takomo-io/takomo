import { executeOperation } from "./execute.js"
import { DeploymentTargetsOperationOutput, PlanHolder } from "./model.js"

export const confirmOperation = async (
  holder: PlanHolder,
): Promise<DeploymentTargetsOperationOutput> => {
  const { io, timer, plan, ctx, input } = holder

  if (ctx.autoConfirmEnabled) {
    return executeOperation(holder)
  }

  const answer = await io.confirmOperation(plan)
  switch (answer) {
    case "CANCEL":
      return {
        results: [],
        outputFormat: input.outputFormat,
        message: "Cancelled",
        status: "CANCELLED",
        success: false,
        timer: timer.stop(),
      }
    case "CONTINUE_AND_REVIEW":
      return executeOperation({
        ...holder,
        input: { ...holder.input, concurrentTargets: 1 },
      })
    case "CONTINUE_NO_REVIEW":
      return executeOperation({
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
