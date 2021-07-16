import { resolveCommandOutputBase } from "@takomo/core"
import { createTimer } from "@takomo/util"
import { processOrganizationalUnit } from "../execute/organizational-units"
import {
  AccountsListener,
  AccountsOperationIO,
  OrganizationalUnitAccountsOperationResult,
} from "../model"
import { AccountsOperationPlanHolder } from "../states"
import { AccountsOperationStep } from "../steps"

interface CreateAccountsListenerProps {
  readonly io: AccountsOperationIO
  readonly stageName: string
  readonly currentStageNumber: number
  readonly stageCount: number
  readonly accountCount: number
}

const createAccountsListener = ({
  io,
  stageName,
  currentStageNumber,
  stageCount,
  accountCount,
}: CreateAccountsListenerProps): AccountsListener =>
  io.createAccountsListener(
    `stage ${currentStageNumber}/${stageCount}: ${stageName},`,
    accountCount,
  )

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
    const stageCount = plan.stages.length

    for (const [i, stage] of plan.stages.entries()) {
      const stageName = stage.stage ?? "default"
      io.info(`Begin stage '${stageName}'`)
      const timer = createTimer(stageName)

      const accountCount = stage.organizationalUnits
        .map((g) => g.accounts)
        .flat().length

      const accountsListener = createAccountsListener({
        io,
        accountCount,
        stageCount,
        currentStageNumber: i + 1,
        stageName,
      })

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

      timer.stop()

      io.info(
        `Completed stage '${stageName}' in ${timer.getFormattedTimeElapsed()}`,
      )
    }

    return transitions.completeAccountsOperation({
      ...state1,
      ...resolveCommandOutputBase(results),
      results,
    })
  }
