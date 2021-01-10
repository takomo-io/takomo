import { planOrganizationPolicies } from "../../../common/plan/policies/plan-organization-policies"
import { BasicConfigPlanHolder } from "../states"
import { AccountsOperationStep } from "../steps"

export const planPolicies: AccountsOperationStep<BasicConfigPlanHolder> = async (
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
