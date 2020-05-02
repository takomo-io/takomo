import { OperationState, resolveCommandOutputBase } from "@takomo/core"
import { StopWatch } from "@takomo/util"
import { DeploymentGroupConfig } from "../../../model"
import {
  DeploymentGroupDeployResult,
  DeploymentTargetDeployResult,
  PlanHolder,
} from "../model"
import { processDeploymentTarget } from "./deployment-target"

export const processDeploymentGroup = async (
  holder: PlanHolder,
  group: DeploymentGroupConfig,
  watch: StopWatch,
  state: OperationState,
): Promise<DeploymentGroupDeployResult> => {
  const { io } = holder

  io.info(`Execute deployment group: ${group.path}`)
  const results = new Array<DeploymentTargetDeployResult>()

  for (const target of group.targets) {
    const targetResult = await processDeploymentTarget(
      holder,
      group,
      target,
      watch.startChild(target.name),
      state,
    )
    results.push(targetResult)
  }

  return {
    ...resolveCommandOutputBase(results),
    results,
    path: group.path,
    watch: watch.stop(),
  }
}
