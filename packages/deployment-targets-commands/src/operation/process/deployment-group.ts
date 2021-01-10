import { resolveCommandOutputBase } from "@takomo/core"
import { DeploymentGroupConfig } from "@takomo/deployment-targets-config"
import { OperationState } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import {
  DeploymentGroupDeployResult,
  DeploymentTargetDeployResult,
  PlanHolder,
} from "../model"
import { processDeploymentTarget } from "./deployment-target"

/**
 * @hidden
 */
export const processDeploymentGroup = async (
  holder: PlanHolder,
  group: DeploymentGroupConfig,
  timer: Timer,
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
      timer.startChild(target.name),
      state,
    )
    results.push(targetResult)
  }

  timer.stop()

  return {
    ...resolveCommandOutputBase(results),
    results,
    path: group.path,
    timer,
  }
}
