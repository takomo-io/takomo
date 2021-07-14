import { validateCommonLocalConfiguration } from "@takomo/organization-context"
import { OrganizationStateHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

export const validateConfiguration: DeployOrganizationStep<OrganizationStateHolder> =
  async (state) => {
    const {
      transitions,
      ctx,
      organizationState: { accounts },
    } = state

    await validateCommonLocalConfiguration(ctx, accounts)

    return transitions.planBasicConfig({
      ...state,
    })
  }
