import { planOrganizationalUnitsDeploy } from "../../../common/plan/organizational-units/plan-organizational-units-deploy"
import { PoliciesPlanHolder } from "../states"
import { AccountsOperationStep } from "../steps"

export const planOrganizationalUnits: AccountsOperationStep<PoliciesPlanHolder> =
  async (state) => {
    const {
      transitions,
      organizationState,
      ctx,
      io,
      organizationBasicConfigPlan,
    } = state

    const organizationalUnitsPlan = await planOrganizationalUnitsDeploy({
      ctx,
      basicConfigPlan: organizationBasicConfigPlan,
      organizationState,
      logger: io,
    })

    return transitions.validateOrganizationState({
      ...state,
      organizationalUnitsPlan,
    })
  }
