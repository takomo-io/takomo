import { createDeploymentPlan } from "../common/plan"
import { confirmOperation } from "./confirm"
import { DeploymentTargetsOperationOutput, InitialHolder } from "./model"

export const planDeployment = async (
  holder: InitialHolder,
): Promise<DeploymentTargetsOperationOutput> => {
  const { ctx, io, input, timer } = holder

  const plan = await createDeploymentPlan({
    ctx,
    logger: io,
    targetsSelectionCriteria: input,
  })

  if (plan.stages.length === 0) {
    timer.stop()
    io.info("No targets to deploy")
    return {
      timer,
      outputFormat: input.outputFormat,
      results: [],
      success: true,
      status: "SKIPPED",
      message: "No targets to deploy",
    }
  }

  return confirmOperation({
    ...holder,
    plan,
  })
}
