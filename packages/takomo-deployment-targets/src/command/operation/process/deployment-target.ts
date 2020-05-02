import { ConfigSetOperationResult } from "@takomo/config-sets"
import { OperationState, resolveCommandOutputBase } from "@takomo/core"
import { StopWatch } from "@takomo/util"
import { DeploymentGroupConfig, DeploymentTargetConfig } from "../../../model"
import { DeploymentTargetDeployResult, PlanHolder } from "../model"
import { processConfigSet } from "./config-set"
export const processDeploymentTarget = async (
  holder: PlanHolder,
  group: DeploymentGroupConfig,
  target: DeploymentTargetConfig,
  watch: StopWatch,
  state: OperationState,
): Promise<DeploymentTargetDeployResult> => {
  const { io, ctx } = holder

  io.info(`Execute deployment target: ${target.name}`)
  const results = new Array<ConfigSetOperationResult>()

  for (const configSetName of target.configSets) {
    const configSet = ctx.getConfigSet(configSetName)
    const result = await processConfigSet(
      holder,
      group,
      target,
      configSet,
      watch.startChild(configSetName),
      state,
    )

    results.push(result)
  }

  return {
    ...resolveCommandOutputBase(results),
    results,
    name: target.name,
    watch: watch.stop(),
  }
}
