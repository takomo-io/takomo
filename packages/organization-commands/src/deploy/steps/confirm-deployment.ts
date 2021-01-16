import { OrganizationalUnitsPlanHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

export const confirmDeployment: DeployOrganizationStep<OrganizationalUnitsPlanHolder> = async (
  state,
) => {
  const {
    transitions,
    io,
    ctx,
    organizationalUnitsPlan,
    policiesPlan,
    basicConfigPlan,
  } = state

  if (
    !organizationalUnitsPlan.hasChanges &&
    !policiesPlan.hasChanges &&
    !basicConfigPlan.hasChanges
  ) {
    return transitions.deployBasicConfig(state)
  }

  io.debug("Confirm deployment")

  if (ctx.autoConfirmEnabled) {
    return transitions.deployBasicConfig(state)
  }

  if (!(await io.confirmDeploy(state))) {
    return transitions.cancelOrganizationDeploy(state)
  }

  return transitions.deployBasicConfig(state)
}
