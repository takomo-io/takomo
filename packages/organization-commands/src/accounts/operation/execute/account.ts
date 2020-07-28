import {
  ConfigSetName,
  ConfigSetOperationResult,
  ConfigSetType,
} from "@takomo/config-sets"
import { OperationState, resolveCommandOutputBase } from "@takomo/core"
import { StopWatch } from "@takomo/util"
import {
  AccountOperationResult,
  LaunchAccountsPlanHolder,
  PlannedAccountDeploymentOrganizationalUnit,
  PlannedLaunchableAccount,
} from "../model"
import { processConfigSet } from "./config-set"

const getConfigSetsToProcess = (
  configSetType: ConfigSetType,
  account: PlannedLaunchableAccount,
): ConfigSetName[] => {
  switch (configSetType) {
    case ConfigSetType.BOOTSTRAP:
      return account.config.bootstrapConfigSets
    case ConfigSetType.STANDARD:
      return account.config.configSets
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
}

export const processAccount = async (
  holder: LaunchAccountsPlanHolder,
  organizationalUnit: PlannedAccountDeploymentOrganizationalUnit,
  plannedAccount: PlannedLaunchableAccount,
  accountWatch: StopWatch,
  state: OperationState,
  configSetType: ConfigSetType,
): Promise<AccountOperationResult> => {
  const { io } = holder

  const account = plannedAccount.config
  io.info(`Process account ${account.id}`)
  const results = new Array<ConfigSetOperationResult>()

  const configSetNames = getConfigSetsToProcess(configSetType, plannedAccount)

  for (const configSetName of configSetNames) {
    const result = await processConfigSet(
      holder,
      organizationalUnit,
      plannedAccount,
      configSetName,
      accountWatch.startChild(configSetName),
      state,
      configSetType,
    )
    results.push(result)
  }

  return {
    ...resolveCommandOutputBase(results),
    results,
    accountId: account.id,
    watch: accountWatch.stop(),
  }
}
