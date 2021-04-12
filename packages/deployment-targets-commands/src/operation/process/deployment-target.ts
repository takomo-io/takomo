import {
  ConfigSetName,
  ConfigSetOperationResult,
  ConfigSetType,
} from "@takomo/config-sets"
import { resolveCommandOutputBase } from "@takomo/core"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "@takomo/deployment-targets-config"
import { OperationState } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import { DeploymentTargetDeployResult, PlanHolder } from "../model"
import { processConfigSet } from "./config-set"

const getConfigSetsToProcess = (
  configSetType: ConfigSetType,
  target: DeploymentTargetConfig,
): ReadonlyArray<ConfigSetName> => {
  switch (configSetType) {
    case "bootstrap":
      return target.bootstrapConfigSets
    case "standard":
      return target.configSets
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
}

/**
 * @hidden
 */
export const processDeploymentTarget = async (
  holder: PlanHolder,
  group: DeploymentGroupConfig,
  target: DeploymentTargetConfig,
  timer: Timer,
  state: OperationState,
): Promise<DeploymentTargetDeployResult> => {
  const { io, ctx, input } = holder

  io.info(`Execute deployment target: ${target.name}`)
  const results = new Array<ConfigSetOperationResult>()

  const configSetNames = getConfigSetsToProcess(input.configSetType, target)

  for (const configSetName of configSetNames) {
    const configSet = ctx.getConfigSet(configSetName)
    const result = await processConfigSet(
      holder,
      group,
      target,
      configSet,
      timer.startChild(configSetName),
      state,
    )

    results.push(result)
  }

  timer.stop()

  return {
    ...resolveCommandOutputBase(results),
    results,
    name: target.name,
    timer,
  }
}
