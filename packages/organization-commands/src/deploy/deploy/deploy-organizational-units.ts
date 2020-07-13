import {
  CommandStatus,
  Constants,
  resolveCommandOutputBase,
} from "@takomo/core"
import { collectFromHierarchy } from "@takomo/util"
import flatten from "lodash.flatten"
import { cleanOrganizationalUnits } from "../clean/organizational-units"
import {
  DeployOrganizationOutput,
  PoliciesDeploymentResultHolder,
} from "../model"
import { addOrUpdateOrganizationalUnits } from "./add-or-update-organizational-units"

export const deployOrganizationalUnits = async (
  holder: PoliciesDeploymentResultHolder,
): Promise<DeployOrganizationOutput> => {
  const {
    ctx,
    watch,
    io,
    result,
    organizationState,
    plan: { organizationalUnitsPlan, organizationBasicConfigPlan },
  } = holder
  const childWatch = watch.startChild("deploy-organizational-units")

  if (result) {
    io.debug("Deploy already completed, cancel organizational units deployment")
    childWatch.stop()
    return cleanOrganizationalUnits({
      ...holder,
      organizationalUnitsDeploymentResult: {
        ...result,
        results: [],
      },
    })
  }

  if (!organizationalUnitsPlan.hasChanges) {
    io.info("No changes to organizational units")
    childWatch.stop()
    return cleanOrganizationalUnits({
      ...holder,
      organizationalUnitsDeploymentResult: {
        message: "Skipped",
        status: CommandStatus.SKIPPED,
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
    Constants.SERVICE_CONTROL_POLICY_TYPE,
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

  childWatch.stop()

  const newResult = resolveCommandOutputBase(results)

  return cleanOrganizationalUnits({
    ...holder,
    result: newResult.success ? null : newResult,
    organizationalUnitsDeploymentResult: {
      ...newResult,
      results,
    },
  })
}
