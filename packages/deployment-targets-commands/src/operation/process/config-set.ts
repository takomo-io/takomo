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
  const { io, ctx, input } = holder

  io.info(`Execute config set: ${configSet.name}`)

  const stacksConfigRepository =
    await ctx.configRepository.createStacksConfigRepository(
      configSet.name,
      configSet.legacy,
    )

  const results = new Array<ConfigSetCommandPathOperationResult>()
  const commandPaths = input.commandPath
    ? [input.commandPath]
    : configSet.commandPaths

  for (const commandPath of commandPaths) {
    const commandPathTimer = timer.startChild(commandPath)

    try {
      const result = await processCommandPath(
        holder,
        group,
        target,
        configSet,
        commandPath,
        commandPathTimer,
        state,
        stacksConfigRepository,
      )

      commandPathTimer.stop()
      results.push(result)

      if (!result.success) {
        state.failed = true
      }
    } catch (e) {
      io.error(
        `Unhandled error when executing group: ${group.path}, target: ${target.name}, config set: ${configSet.name}, command path: ${commandPath}`,
        e,
      )

      state.failed = true
      results.push({
        commandPath,
        result: {
          message: e.message,
          status: "FAILED",
          timer,
          success: false,
          results: [],
        },
        success: false,
        status: "FAILED",
        message: "Failed",
      })
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
