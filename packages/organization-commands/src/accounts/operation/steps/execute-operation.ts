import { resolveCommandOutputBase } from "@takomo/core"
import { processOrganizationalUnit } from "../execute/organizational-units"
import { OrganizationalUnitAccountsOperationResult } from "../model"
import { AccountsOperationPlanHolder } from "../states"
import { AccountsOperationStep } from "../steps"

export const executeOperation: AccountsOperationStep<AccountsOperationPlanHolder> = async (
  state1,
) => {
  const {
    transitions,
    ctx,
    io,
    accountsLaunchPlan: plan,
    input: { configSetType },
    totalTimer,
  } = state1
  const results = new Array<OrganizationalUnitAccountsOperationResult>()

  io.info("Process operation")

  const state = { failed: false }

  for (const organizationalUnit of plan.organizationalUnits) {
    const result = await processOrganizationalUnit(
      state1,
      organizationalUnit,
      totalTimer.startChild(organizationalUnit.path),
      state,
      configSetType,
    )

    results.push(result)
  }

  return transitions.completeAccountsOperation({
    ...state1,
    ...resolveCommandOutputBase(results),
    results,
  })
}
