import { loadOrganizationState } from "@takomo/organization-context"
import { InitialAccountsOperationState } from "../states"
import { AccountsOperationStep } from "../steps"

export const loadOrganizationData: AccountsOperationStep<InitialAccountsOperationState> =
  async (state) => {
    const { transitions, ctx, io } = state

    const organizationState = await loadOrganizationState(ctx, io)

    return transitions.validateConfiguration({
      ...state,
      organizationState,
    })
  }
