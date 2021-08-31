import { createAccountsPlan } from "../../common/plan"
import { AccountsLaunchPlan } from "../model"
import { OrganizationStateHolder } from "../states"
import { AccountsOperationStep } from "../steps"

const planAccountsDeploy = async ({
  ctx,
  io,
  organizationState,
  input,
}: OrganizationStateHolder): Promise<AccountsLaunchPlan> => {
  const plan = await createAccountsPlan({
    ctx,
    logger: io,
    organizationState,
    accountsSelectionCriteria: input,
  })

  return {
    ...plan,
    hasChanges: plan.stages.length > 0,
  }
}

export const planOperation: AccountsOperationStep<OrganizationStateHolder> =
  async (state) => {
    const { transitions, io } = state

    io.info("Plan operation")

    const accountsLaunchPlan = await planAccountsDeploy(state)

    if (!accountsLaunchPlan.hasChanges) {
      const message = "No accounts to process"
      return transitions.skipAccountsOperation({ ...state, message })
    }

    return transitions.confirmOperation({
      ...state,
      accountsLaunchPlan,
    })
  }
