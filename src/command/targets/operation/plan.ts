import { OutputFormat } from "../../../takomo-core/command.js"
import { Timer } from "../../../utils/timer.js"
import { createExecutionPlan } from "../common/plan/config-set-execution-plan.js"
import { confirmOperation } from "./confirm.js"
import { DeploymentTargetsOperationOutput, InitialHolder } from "./model.js"

const skippedResult = (
  timer: Timer,
  outputFormat: OutputFormat,
): DeploymentTargetsOperationOutput => ({
  timer,
  outputFormat,
  results: [],
  success: true,
  status: "SKIPPED",
  message: "No targets to deploy",
})

export const planDeployment = async (
  holder: InitialHolder,
): Promise<DeploymentTargetsOperationOutput> => {
  const { ctx, io, input, timer } = holder

  const plan = await createExecutionPlan({
    ctx,
    logger: io,
    targetsSelectionCriteria: input,
  })

  if (plan.stages.length === 0) {
    io.info("No targets to deploy")
    return skippedResult(timer.stop(), input.outputFormat)
  }

  return confirmOperation({
    ...holder,
    plan,
  })
}
