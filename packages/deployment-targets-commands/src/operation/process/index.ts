import { resolveCommandOutputBase } from "@takomo/core"
import {
  DeploymentGroupDeployResult,
  DeploymentTargetsOperationOutput,
  PlanHolder,
} from "../model"
import { processDeploymentGroup } from "./deployment-group"

/**
 * @hidden
 */
export const processOperation = async (
  holder: PlanHolder,
): Promise<DeploymentTargetsOperationOutput> => {
  const { timer, io, plan, input } = holder
  const childTimer = timer.startChild("process")
  const results = new Array<DeploymentGroupDeployResult>()

  io.info("Process operation")

  const state = { failed: false }

  for (const group of plan.groups) {
    const result = await processDeploymentGroup(
      holder,
      group,
      childTimer.startChild(group.name),
      state,
    )
    results.push(result)
  }

  childTimer.stop()

  return {
    ...resolveCommandOutputBase(results),
    results,
    outputFormat: input.outputFormat,
    timer: childTimer,
  }
}
