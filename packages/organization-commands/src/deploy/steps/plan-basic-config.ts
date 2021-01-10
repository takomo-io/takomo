import { planOrganizationBasicConfig } from "../../common/plan/basic-config/organization-basic-config"
import { OrganizationStateHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

export const planBasicConfig: DeployOrganizationStep<OrganizationStateHolder> = async (
  state,
) => {
  const { transitions, ctx, organizationState, io } = state

  const organizationBasicConfigPlan = await planOrganizationBasicConfig({
    ctx,
    logger: io,
    organizationState,
  })

  return transitions.planPolicies({
    ...state,
    organizationBasicConfigPlan,
  })
}
