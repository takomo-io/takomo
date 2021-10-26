import { OutputFormat } from "@takomo/core"
import { Timer } from "@takomo/util"
import { createConfigSetExecutionPlan } from "../common/plan/config-set-execution-plan"
import { confirmOperation } from "./confirm"
import { DeploymentTargetsOperationOutput, InitialHolder } from "./model"

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

  const plan = await createConfigSetExecutionPlan({
    ctx,
    logger: io,
    targetsSelectionCriteria: input,
  })

  if (plan.stages.length === 0) {
    timer.stop()
    io.info("No targets to deploy")
    return skippedResult(timer, input.outputFormat)
  }

  return confirmOperation({
    ...holder,
    plan,
  })
}
