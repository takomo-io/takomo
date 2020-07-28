import { ConfigSetType } from "@takomo/config-sets"
import { OperationState, resolveCommandOutputBase } from "@takomo/core"
import { StopWatch } from "@takomo/util"
import {
  AccountOperationResult,
  LaunchAccountsPlanHolder,
  OrganizationalUnitAccountsOperationResult,
  PlannedAccountDeploymentOrganizationalUnit,
} from "../model"
import { processAccount } from "./account"

export const processOrganizationalUnit = async (
  holder: LaunchAccountsPlanHolder,
  organizationalUnit: PlannedAccountDeploymentOrganizationalUnit,
  watch: StopWatch,
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
      watch.startChild(account.account.Id!),
      state,
      configSetType,
    )
    results.push(result)
  }

  return {
    ...resolveCommandOutputBase(results),
    path: organizationalUnit.path,
    results,
    watch: watch.stop(),
  }
}
