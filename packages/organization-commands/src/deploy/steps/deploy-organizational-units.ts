import { resolveCommandOutputBase } from "@takomo/core"
import { addOrUpdateOrganizationalUnits } from "../deploy/add-or-update-organizational-units"
import { PoliciesDeploymentResultHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

export const deployOrganizationalUnits: DeployOrganizationStep<PoliciesDeploymentResultHolder> = async (
  state,
) => {
  const {
    transitions,
    ctx,
    io,
    organizationState,
    organizationalUnitsPlan,
    basicConfigPlan,
  } = state

  if (!organizationalUnitsPlan.hasChanges) {
    io.info("No changes to organizational units")
    return transitions.cleanOrganizationalUnits({
      ...state,
      organizationalUnitsDeploymentResult: {
        message: "No changes",
        status: "SUCCESS",
        success: true,
      },
    })
  }

  io.info("Deploy organizational units")

  const enabledPolicyTypes = [
    ...basicConfigPlan.enabledPolicies.add,
    ...basicConfigPlan.enabledPolicies.retain,
  ]

  const serviceControlPoliciesJustEnabled = basicConfigPlan.enabledPolicies.add.includes(
    "SERVICE_CONTROL_POLICY",
  )

  const results = await addOrUpdateOrganizationalUnits(
    io,
    ctx.getClient(),
    enabledPolicyTypes,
    serviceControlPoliciesJustEnabled,
    organizationState,
    organizationalUnitsPlan.root,
    null,
  )

  io.debugObject("Organizational units deployment results:", results)

  return transitions.cleanOrganizationalUnits({
    ...state,
    organizationalUnitsDeploymentResult: {
      ...resolveCommandOutputBase(results),
    },
  })
}
