import {
  ConfigSet,
  ConfigSetCommandPathOperationResult,
  ConfigSetOperationResult,
} from "@takomo/config-sets"
import { resolveCommandOutputBase } from "@takomo/core"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "@takomo/deployment-targets-config"
import { OperationState } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import { PlanHolder } from "../model"
import { processCommandPath } from "./command-path"

/**
 * @hidden
 */
export const processConfigSet = async (
  holder: PlanHolder,
  group: DeploymentGroupConfig,
  target: DeploymentTargetConfig,
  configSet: ConfigSet,
  timer: Timer,
  state: OperationState,
): Promise<ConfigSetOperationResult> => {
  const { io } = holder

  io.info(`Execute config set: ${configSet.name}`)

  const results = new Array<ConfigSetCommandPathOperationResult>()

  for (const commandPath of configSet.commandPaths) {
    const result = await processCommandPath(
      holder,
      group,
      target,
      configSet,
      commandPath,
      timer.startChild(commandPath),
      state,
    )
    results.push(result)

    if (!result.success) {
      state.failed = true
    }
  }

  timer.stop()

  return {
    ...resolveCommandOutputBase(results),
    results,
    configSetName: configSet.name,
    timer,
  }
}
