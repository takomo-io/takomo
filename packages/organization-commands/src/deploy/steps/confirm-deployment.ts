import { OrganizationalUnitsPlanHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

export const confirmDeployment: DeployOrganizationStep<OrganizationalUnitsPlanHolder> = async (
  state,
) => {
  const { transitions, io, ctx } = state

  io.debug("Confirm deployment")

  if (ctx.autoConfirmEnabled) {
    return transitions.deployBasicConfig(state)
  }

  if (!(await io.confirmDeploy(state))) {
    return transitions.cancelOrganizationDeploy({
      ...state,
      message: "Cancelled",
    })
  }

  return transitions.deployBasicConfig(state)
}
