import {
  ConfigSetName,
  ConfigSetOperationResult,
  ConfigSetStage,
  ConfigSetType,
} from "@takomo/config-sets"
import { resolveCommandOutputBase } from "@takomo/core"
import { OperationState } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import {
  AccountOperationResult,
  PlannedAccountDeploymentOrganizationalUnit,
  PlannedLaunchableAccount,
} from "../model"
import { AccountsOperationPlanHolder } from "../states"
import { processConfigSet } from "./config-set"

const getConfigSetsToProcess = (
  configSetType: ConfigSetType,
  account: PlannedLaunchableAccount,
  stage?: ConfigSetStage,
): ReadonlyArray<ConfigSetName> => {
  switch (configSetType) {
    case "bootstrap":
      return account.config.bootstrapConfigSets
        .filter((c) => c.stage === stage)
        .map((c) => c.name)
    case "standard":
      return account.config.configSets
        .filter((c) => c.stage === stage)
        .map((c) => c.name)
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
}

export const processAccount = async (
  holder: AccountsOperationPlanHolder,
  organizationalUnit: PlannedAccountDeploymentOrganizationalUnit,
  plannedAccount: PlannedLaunchableAccount,
  accountTimer: Timer,
  state: OperationState,
  configSetType: ConfigSetType,
  stage?: ConfigSetStage,
): Promise<AccountOperationResult> => {
  const { io } = holder

  const account = plannedAccount.config
  io.info(`Process account: '${account.id}'`)
  const results = new Array<ConfigSetOperationResult>()

  const configSetNames = getConfigSetsToProcess(
    configSetType,
    plannedAccount,
    stage,
  )

  for (const configSetName of configSetNames) {
    const result = await processConfigSet(
      holder,
      organizationalUnit,
      plannedAccount,
      configSetName,
      accountTimer.startChild(configSetName),
      state,
      configSetType,
      stage,
    )
    results.push(result)
  }

  accountTimer.stop()

  return {
    ...resolveCommandOutputBase(results),
    results,
    accountId: account.id,
    timer: accountTimer,
  }
}
