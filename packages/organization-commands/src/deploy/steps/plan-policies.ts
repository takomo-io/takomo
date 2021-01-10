import { planOrganizationPolicies } from "../../common/plan/policies/plan-organization-policies"
import { BasicConfigPlanHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

export const planPolicies: DeployOrganizationStep<BasicConfigPlanHolder> = async (
  state,
) => {
  const { transitions, organizationState, ctx, configRepository, io } = state

  const policiesPlan = await planOrganizationPolicies({
    logger: io,
    configRepository,
    ctx,
    organizationState,
  })

  return transitions.planOrganizationalUnits({
    ...state,
    policiesPlan,
  })
}
