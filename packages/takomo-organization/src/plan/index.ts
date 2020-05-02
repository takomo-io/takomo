import { OrganizationContext } from "../context"
import { OrganizationData, OrganizationLaunchPlan } from "../model"
import { planOrganizationBasicConfigDeployment } from "./basic-config"
import { planOrganizationUnitsDeployment } from "./organizational-units"
import { planPoliciesDeployment } from "./policies"

export const planOrganizationLaunch = async (
  ctx: OrganizationContext,
  data: OrganizationData,
): Promise<OrganizationLaunchPlan> => {
  const [
    policiesPlan,
    organizationalUnitsPlan,
    organizationBasicConfigPlan,
  ] = await Promise.all([
    planPoliciesDeployment(ctx, data),
    planOrganizationUnitsDeployment(ctx, data),
    planOrganizationBasicConfigDeployment(ctx, data),
  ])

  const hasChanges =
    policiesPlan.hasChanges ||
    organizationalUnitsPlan.hasChanges ||
    organizationBasicConfigPlan.hasChanges

  return {
    policiesPlan,
    organizationalUnitsPlan,
    organizationBasicConfigPlan,
    hasChanges,
  }
}
