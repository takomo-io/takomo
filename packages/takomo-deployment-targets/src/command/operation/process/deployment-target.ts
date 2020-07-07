import {
  ConfigSetName,
  ConfigSetOperationResult,
  ConfigSetType,
} from "@takomo/config-sets"
import { OperationState, resolveCommandOutputBase } from "@takomo/core"
import { StopWatch } from "@takomo/util"
import { DeploymentGroupConfig, DeploymentTargetConfig } from "../../../model"
import { DeploymentTargetDeployResult, PlanHolder } from "../model"
import { processConfigSet } from "./config-set"

const getConfigSetsToProcess = (
  configSetType: ConfigSetType,
  target: DeploymentTargetConfig,
): ConfigSetName[] => {
  switch (configSetType) {
    case ConfigSetType.BOOTSTRAP:
      return target.bootstrapConfigSets
    case ConfigSetType.STANDARD:
      return target.configSets
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
}

export const processDeploymentTarget = async (
  holder: PlanHolder,
  group: DeploymentGroupConfig,
  target: DeploymentTargetConfig,
  watch: StopWatch,
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
