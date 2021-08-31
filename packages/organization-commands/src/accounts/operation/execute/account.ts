import {
  ConfigSetInstruction,
  ConfigSetName,
  ConfigSetOperationResult,
  ConfigSetStage,
  ConfigSetType,
} from "@takomo/config-sets"
import { resolveCommandOutputBase } from "@takomo/core"
import { OperationState } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import { AccountsPlanAccount, AccountsPlanOU } from "../../common/model"
import { AccountOperationResult } from "../model"
import { AccountsOperationPlanHolder } from "../states"
import { processConfigSet } from "./config-set"

interface GetConfigSetsToProcessProps {
  readonly configSetType: ConfigSetType
  readonly account: AccountsPlanAccount
  readonly stage?: ConfigSetStage
  readonly configSetName?: ConfigSetName
}

const getConfigSetsToProcess = ({
  configSetType,
  account,
  stage,
  configSetName,
}: GetConfigSetsToProcessProps): ReadonlyArray<ConfigSetName> => {
  const configSetNameMatches = (cs: ConfigSetInstruction): boolean =>
    configSetName === undefined || cs.name === configSetName
  const configSetStageMatches = (cs: ConfigSetInstruction): boolean =>
    stage === undefined || cs.stage === stage

  switch (configSetType) {
    case "bootstrap":
      return account.config.bootstrapConfigSets
        .filter(configSetStageMatches)
        .filter(configSetNameMatches)
        .map((c) => c.name)
    case "standard":
      return account.config.configSets
        .filter(configSetStageMatches)
        .filter(configSetNameMatches)
        .map((c) => c.name)
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
}

export const processAccount = async (
  holder: AccountsOperationPlanHolder,
  organizationalUnit: AccountsPlanOU,
  plannedAccount: AccountsPlanAccount,
  accountTimer: Timer,
  state: OperationState,
  configSetType: ConfigSetType,
  stage?: ConfigSetStage,
  configSetName?: ConfigSetName,
): Promise<AccountOperationResult> => {
  const { io } = holder

  const account = plannedAccount.config
  io.info(`Process account: '${account.id}'`)
  const results = new Array<ConfigSetOperationResult>()

  const configSetNames = getConfigSetsToProcess({
    configSetType,
    stage,
    configSetName,
    account: plannedAccount,
  })

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
