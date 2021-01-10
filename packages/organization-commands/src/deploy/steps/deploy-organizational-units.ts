import { resolveCommandOutputBase } from "@takomo/core"
import { collectFromHierarchy } from "@takomo/util"
import flatten from "lodash.flatten"
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
    organizationBasicConfigPlan,
  } = state

  if (!organizationalUnitsPlan.hasChanges) {
    io.info("No changes to organizational units")
    return transitions.cleanOrganizationalUnits({
      ...state,
      organizationalUnitsDeploymentResult: {
        message: "Skipped",
        status: "SKIPPED",
        success: true,
        results: [],
      },
    })
  }

  io.info("Deploy organizational units")

  const enabledPolicyTypes = [
    ...organizationBasicConfigPlan.enabledPolicies.add,
    ...organizationBasicConfigPlan.enabledPolicies.retain,
  ]

  const currentOus = flatten(
    collectFromHierarchy(
      organizationState.rootOrganizationalUnit,
      (o) => o.children,
    ),
  )

  const serviceControlPoliciesJustEnabled = organizationBasicConfigPlan.enabledPolicies.add.includes(
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
      results,
    },
  })
}
