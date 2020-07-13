import { resolveCommandOutputBase } from "@takomo/core"
import {
  DeploymentGroupDeployResult,
  DeploymentTargetsOperationOutput,
  PlanHolder,
} from "../model"
import { processDeploymentGroup } from "./deployment-group"

export const processOperation = async (
  holder: PlanHolder,
): Promise<DeploymentTargetsOperationOutput> => {
  const { watch, io, plan } = holder
  const childWatch = watch.startChild("process")
  const results = new Array<DeploymentGroupDeployResult>()

  io.info("Process operation")

  const state = { failed: false }

  for (const group of plan.groups) {
    const result = await processDeploymentGroup(
      holder,
      group,
      childWatch.startChild(group.name),
      state,
    )
    results.push(result)
  }

  return {
    ...resolveCommandOutputBase(results),
    results,
    watch: childWatch.stop(),
  }
}
