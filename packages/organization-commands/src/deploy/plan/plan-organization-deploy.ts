import {
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { planOrganizationBasicConfigDeployment } from "./basic-config"
import { OrganizationLaunchPlan } from "./model"
import { planOrganizationUnitsDeployment } from "./plan-organizational-units-deployment"
import { planPoliciesDeployment } from "./plan-policies-deployment"

export const planOrganizationDeploy = async (
  ctx: OrganizationContext,
  organizationState: OrganizationState,
): Promise<OrganizationLaunchPlan> => {
  const organizationBasicConfigPlan = await planOrganizationBasicConfigDeployment(
    ctx,
    organizationState,
  )

  const [policiesPlan, organizationalUnitsPlan] = await Promise.all([
    planPoliciesDeployment(ctx, organizationState),
    planOrganizationUnitsDeployment(
      ctx,
      organizationState,
      organizationBasicConfigPlan.enabledPolicies,
    ),
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
