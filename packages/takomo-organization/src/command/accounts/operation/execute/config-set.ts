import {
  ConfigSetCommandPathOperationResult,
  ConfigSetName,
  ConfigSetOperationResult,
  ConfigSetType,
} from "@takomo/config-sets"
import { OperationState, resolveCommandOutputBase } from "@takomo/core"
import { StopWatch } from "@takomo/util"
import {
  PlannedAccountDeploymentOrganizationalUnit,
  PlannedLaunchableAccount,
} from "../../../../model"
import { LaunchAccountsPlanHolder } from "../model"
import { processCommandPath } from "./command-path"

export const processConfigSet = async (
  holder: LaunchAccountsPlanHolder,
  ou: PlannedAccountDeploymentOrganizationalUnit,
  plannedAccount: PlannedLaunchableAccount,
  configSetName: ConfigSetName,
  configSetWatch: StopWatch,
  state: OperationState,
  configSetType: ConfigSetType,
): Promise<ConfigSetOperationResult> => {
  const { io, ctx } = holder

  io.info(`Process config set: ${configSetName}`)
  const configSet = ctx.getConfigSet(configSetName)
  const results = new Array<ConfigSetCommandPathOperationResult>()

  for (const commandPath of configSet.commandPaths) {
    const result = await processCommandPath(
      holder,
      ou,
      plannedAccount,
      configSetName,
      commandPath,
      configSetWatch.startChild(commandPath),
      state,
      configSetType,
    )

    if (!result.success) {
      state.failed = true
    }

    results.push(result)
  }

  return {
    ...resolveCommandOutputBase(results),
    configSetName,
    results,
    watch: configSetWatch.stop(),
  }
}
