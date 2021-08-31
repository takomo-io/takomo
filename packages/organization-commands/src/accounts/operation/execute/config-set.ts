import {
  ConfigSetCommandPathOperationResult,
  ConfigSetName,
  ConfigSetOperationResult,
  ConfigSetStage,
  ConfigSetType,
} from "@takomo/config-sets"
import { resolveCommandOutputBase } from "@takomo/core"
import { OperationState } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import { AccountsPlanAccount, AccountsPlanOU } from "../../common/model"
import { AccountsOperationPlanHolder } from "../states"
import { processCommandPath } from "./command-path"

export const processConfigSet = async (
  holder: AccountsOperationPlanHolder,
  ou: AccountsPlanOU,
  plannedAccount: AccountsPlanAccount,
  configSetName: ConfigSetName,
  configSetTimer: Timer,
  state: OperationState,
  configSetType: ConfigSetType,
  stage?: ConfigSetStage,
): Promise<ConfigSetOperationResult> => {
  const { io, ctx, configRepository, input } = holder

  io.info(`Process config set: '${configSetName}'`)
  const configSet = ctx.getConfigSet(configSetName)
  const stacksConfigRepository =
    await configRepository.createStacksConfigRepository(
      configSet.name,
      configSet.legacy,
    )

  const results = new Array<ConfigSetCommandPathOperationResult>()
  const commandPaths = input.commandPath
    ? [input.commandPath]
    : configSet.commandPaths

  for (const commandPath of commandPaths) {
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
      stage,
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
    outputFormat: input.outputFormat,
    timer: configSetTimer,
  }
}
