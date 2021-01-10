import { ConfirmResult } from "@takomo/core"
import { AccountsOperationPlanHolder } from "../states"
import { AccountsOperationStep } from "../steps"

export const confirmOperation: AccountsOperationStep<AccountsOperationPlanHolder> = async (
  state,
) => {
  const { transitions, io, ctx, accountsLaunchPlan } = state

  if (ctx.autoConfirmEnabled) {
    return transitions.executeOperation(state)
  }

  if ((await io.confirmLaunch(accountsLaunchPlan)) === ConfirmResult.NO) {
    return transitions.cancelAccountsOperation({
      ...state,
      message: "Cancelled",
    })
  }

  return transitions.executeOperation(state)
}
