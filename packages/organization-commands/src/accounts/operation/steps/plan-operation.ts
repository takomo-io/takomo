import { createAccountsPlan } from "../../common/plan"
import { OrganizationStateHolder } from "../states"
import { AccountsOperationStep } from "../steps"

export const planOperation: AccountsOperationStep<OrganizationStateHolder> =
  async (state) => {
    const { transitions, io, input, organizationState, ctx } = state

    io.info("Plan operation")

    const accountsLaunchPlan = await createAccountsPlan({
      ctx,
      logger: io,
      organizationState,
      accountsSelectionCriteria: input,
    })

    if (accountsLaunchPlan.stages.length === 0) {
      const message = "No accounts to process"
      return transitions.skipAccountsOperation({ ...state, message })
    }

    return transitions.confirmOperation({
      ...state,
      accountsLaunchPlan,
    })
  }
