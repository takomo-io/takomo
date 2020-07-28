import {
  buildOptionsForConfigSet,
  ConfigSet,
  ConfigSetCommandPathOperationResult,
  ConfigSetOperationResult,
} from "@takomo/config-sets"
import { OperationState, resolveCommandOutputBase } from "@takomo/core"
import { StopWatch } from "@takomo/util"
import { DeploymentGroupConfig, DeploymentTargetConfig } from "../../../model"
import { PlanHolder } from "../model"
import { processCommandPath } from "./command-path"

export const processConfigSet = async (
  holder: PlanHolder,
  group: DeploymentGroupConfig,
  target: DeploymentTargetConfig,
  configSet: ConfigSet,
  watch: StopWatch,
  state: OperationState,
): Promise<ConfigSetOperationResult> => {
  const { io, ctx } = holder

  io.info(`Execute config set: ${configSet.name}`)

  const results = new Array<ConfigSetCommandPathOperationResult>()
  const options = buildOptionsForConfigSet(ctx.getOptions(), configSet)

  for (const commandPath of configSet.commandPaths) {
    const result = await processCommandPath(
      holder,
      group,
      target,
      configSet,
      options,
      commandPath,
      watch.startChild(commandPath),
      state,
    )
    results.push(result)

    if (!result.success) {
      state.failed = true
    }
  }

  return {
    ...resolveCommandOutputBase(results),
    results,
    configSetName: configSet.name,
    watch: watch.stop(),
  }
}
