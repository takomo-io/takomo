import {
  ConfigSetCommandPathOperationResult,
  ConfigSetName,
  ConfigSetOperationResult,
  ConfigSetType,
} from "@takomo/config-sets"
import { resolveCommandOutputBase } from "@takomo/core"
import { OperationState } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import {
  PlannedAccountDeploymentOrganizationalUnit,
  PlannedLaunchableAccount,
} from "../model"
import { AccountsOperationPlanHolder } from "../states"
import { processCommandPath } from "./command-path"

export const processConfigSet = async (
  holder: AccountsOperationPlanHolder,
  ou: PlannedAccountDeploymentOrganizationalUnit,
  plannedAccount: PlannedLaunchableAccount,
  configSetName: ConfigSetName,
  configSetTimer: Timer,
  state: OperationState,
  configSetType: ConfigSetType,
): Promise<ConfigSetOperationResult> => {
  const { io, ctx, configRepository } = holder

  io.info(`Process config set: '${configSetName}'`)
  const configSet = ctx.getConfigSet(configSetName)
  const stacksConfigRepository = await configRepository.createStacksConfigRepository(
    configSet.name,
    configSet.legacy,
  )

  const results = new Array<ConfigSetCommandPathOperationResult>()

  for (const commandPath of configSet.commandPaths) {
    const result = await processCommandPath(
      holder,
      ou,
      plannedAccount,
      configSetName,
      commandPath,
      configSetTimer.startChild(commandPath),
      state,
      configSetType,
      stacksConfigRepository,
    )

    if (!result.success) {
      state.failed = true
    }

    results.push(result)
  }

  configSetTimer.stop()
  return {
    ...resolveCommandOutputBase(results),
    configSetName,
    results,
    timer: configSetTimer,
  }
}
