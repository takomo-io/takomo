import { ConfigSetType } from "@takomo/config-sets"
import { resolveCommandOutputBase } from "@takomo/core"
import { OperationState } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import {
  AccountOperationResult,
  OrganizationalUnitAccountsOperationResult,
  PlannedAccountDeploymentOrganizationalUnit,
} from "../model"
import { AccountsOperationPlanHolder } from "../states"
import { processAccount } from "./account"

export const processOrganizationalUnit = async (
  holder: AccountsOperationPlanHolder,
  organizationalUnit: PlannedAccountDeploymentOrganizationalUnit,
  timer: Timer,
  state: OperationState,
  configSetType: ConfigSetType,
): Promise<OrganizationalUnitAccountsOperationResult> => {
  const { io } = holder

  io.info(
    `Process organizational unit '${organizationalUnit.path}' with ${organizationalUnit.accounts.length} account(s)`,
  )

  const results = new Array<AccountOperationResult>()
  for (const account of organizationalUnit.accounts) {
    const result = await processAccount(
      holder,
      organizationalUnit,
      account,
      timer.startChild(account.account.id),
      state,
      configSetType,
    )
    results.push(result)
  }

  timer.stop()
  return {
    ...resolveCommandOutputBase(results),
    path: organizationalUnit.path,
    results,
    timer,
  }
}
