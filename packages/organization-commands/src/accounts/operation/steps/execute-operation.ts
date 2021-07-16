import { resolveCommandOutputBase } from "@takomo/core"
import { processOrganizationalUnit } from "../execute/organizational-units"
import { OrganizationalUnitAccountsOperationResult } from "../model"
import { AccountsOperationPlanHolder } from "../states"
import { AccountsOperationStep } from "../steps"

export const executeOperation: AccountsOperationStep<AccountsOperationPlanHolder> =
  async (state1) => {
    const {
      transitions,
      io,
      accountsLaunchPlan: plan,
      input: { configSetType },
      totalTimer,
    } = state1
    const results = new Array<OrganizationalUnitAccountsOperationResult>()

    io.info("Process operation")

    const state = { failed: false }

    for (const [i, stage] of plan.stages.entries()) {
      io.info(`Begin stage: ${stage.stage}`)

      const accountCount = stage.organizationalUnits
        .map((g) => g.accounts)
        .flat().length

      const accountsListener = io.createAccountsListener(
        `[${stage.stage} ${i + 1}/${plan.stages.length}]`,
        accountCount,
      )

      for (const organizationalUnit of stage.organizationalUnits) {
        const result = await processOrganizationalUnit(
          accountsListener,
          state1,
          organizationalUnit,
          totalTimer.startChild(organizationalUnit.path),
          state,
          configSetType,
          stage.stage,
        )

        results.push(result)
      }
    }

    return transitions.completeAccountsOperation({
      ...state1,
      ...resolveCommandOutputBase(results),
      results,
    })
  }
