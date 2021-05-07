import { ConfigSetType } from "@takomo/config-sets"
import { resolveCommandOutputBase } from "@takomo/core"
import { OperationState } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import { IPolicy, Policy } from "cockatiel"
import {
  AccountOperationResult,
  AccountsListener,
  OrganizationalUnitAccountsOperationResult,
  PlannedAccountDeploymentOrganizationalUnit,
  PlannedLaunchableAccount,
} from "../model"
import { AccountsOperationPlanHolder } from "../states"
import { processAccount } from "./account"

type AccountOperation = () => Promise<AccountOperationResult>

interface ConvertToOperationProps {
  readonly holder: AccountsOperationPlanHolder
  readonly organizationalUnit: PlannedAccountDeploymentOrganizationalUnit
  readonly timer: Timer
  readonly policy: IPolicy
  readonly account: PlannedLaunchableAccount
  readonly state: OperationState
  readonly configSetType: ConfigSetType
  readonly results: Array<AccountOperationResult>
  readonly accountsListener: AccountsListener
}

const convertToOperation = ({
  holder,
  organizationalUnit,
  timer,
  policy,
  account,
  state,
  configSetType,
  results,
  accountsListener,
}: ConvertToOperationProps): AccountOperation => () =>
  policy.execute(async () => {
    await accountsListener.onAccountBegin()
    const result = await processAccount(
      holder,
      organizationalUnit,
      account,
      timer.startChild(account.account.id),
      state,
      configSetType,
    )

    results.push(result)
    await accountsListener.onAccountComplete()
    return result
  })

export const processOrganizationalUnit = async (
  holder: AccountsOperationPlanHolder,
  organizationalUnit: PlannedAccountDeploymentOrganizationalUnit,
  timer: Timer,
  state: OperationState,
  configSetType: ConfigSetType,
): Promise<OrganizationalUnitAccountsOperationResult> => {
  const {
    io,
    input: { concurrentAccounts },
    accountsListener,
  } = holder

  io.info(
    `Process organizational unit '${organizationalUnit.path}' with ${organizationalUnit.accounts.length} account(s)`,
  )

  const policy = Policy.bulkhead(concurrentAccounts, 10000)
  const results = new Array<AccountOperationResult>()

  const operations = organizationalUnit.accounts.map((account) =>
    convertToOperation({
      holder,
      timer,
      policy,
      account,
      configSetType,
      organizationalUnit,
      results,
      state,
      accountsListener,
    }),
  )

  await Promise.all(operations.map((o) => o()))

  timer.stop()
  return {
    ...resolveCommandOutputBase(results),
    path: organizationalUnit.path,
    results,
    timer,
  }
}
