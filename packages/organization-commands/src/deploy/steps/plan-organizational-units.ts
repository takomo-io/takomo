import { planOrganizationalUnitsDeploy } from "../../common/plan/organizational-units/plan-organizational-units-deploy"
import { PoliciesPlanHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

export const planOrganizationalUnits: DeployOrganizationStep<PoliciesPlanHolder> =
  async (state) => {
    const { transitions, organizationState, ctx, io, basicConfigPlan } = state

    const organizationalUnitsPlan = await planOrganizationalUnitsDeploy({
      ctx,
      basicConfigPlan,
      organizationState,
      logger: io,
    })

    return transitions.confirmDeployment({
      ...state,
      organizationalUnitsPlan,
    })
  }
