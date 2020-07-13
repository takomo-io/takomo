import {
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { createOrganizationalUnitsDeploymentPlan } from "./create-organizational-units-deployment-plan"
import {
  EnabledPoliciesPlan,
  OrganizationalUnitsDeploymentPlan,
  PlannedOrganizationalUnit,
} from "./model"

export const planOrganizationUnitsDeployment = async (
  ctx: OrganizationContext,
  organizationState: OrganizationState,
  enabledPoliciesPlan: EnabledPoliciesPlan,
): Promise<OrganizationalUnitsDeploymentPlan> => {
  const { rootOrganizationalUnit } = organizationState

  const configFile = ctx.getOrganizationConfigFile()
  const {
    organizationalUnits: { Root },
  } = configFile

  const root = createOrganizationalUnitsDeploymentPlan(
    ctx.getLogger(),
    enabledPoliciesPlan,
    "Root",
    Root,
    rootOrganizationalUnit,
    organizationState,
    null,
  )

  const hasChanges = (ou: PlannedOrganizationalUnit): boolean => {
    if (ou.operation !== "skip") {
      return true
    }

    return ou.children.find((c) => hasChanges(c)) !== undefined
  }

  return {
    hasChanges: hasChanges(root),
    root,
  }
}
