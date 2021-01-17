import {
  ConfigSetName,
  ConfigSetOperationResult,
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
): ReadonlyArray<ConfigSetName> => {
  switch (configSetType) {
    case "bootstrap":
      return account.config.bootstrapConfigSets
    case "standard":
      return account.config.configSets
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
): Promise<AccountOperationResult> => {
  const { io } = holder

  const account = plannedAccount.config
  io.info(`Process account: '${account.id}'`)
  const results = new Array<ConfigSetOperationResult>()

  const configSetNames = getConfigSetsToProcess(configSetType, plannedAccount)

  for (const configSetName of configSetNames) {
    const result = await processConfigSet(
      holder,
      organizationalUnit,
      plannedAccount,
      configSetName,
      accountTimer.startChild(configSetName),
      state,
      configSetType,
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
