import { loadOrganizationState } from "@takomo/organization-context"
import { InitialDeployOrganizationState } from "../states"
import { DeployOrganizationStep } from "../steps"

export const loadOrganizationData: DeployOrganizationStep<InitialDeployOrganizationState> =
  async (state) => {
    const { transitions, ctx, io } = state

    const organizationState = await loadOrganizationState(ctx, io)

    return transitions.validateConfiguration({
      ...state,
      organizationState,
    })
  }
