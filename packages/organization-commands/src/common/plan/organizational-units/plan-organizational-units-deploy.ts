import {
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { TkmLogger } from "@takomo/util"
import { OrganizationBasicConfigDeploymentPlan } from "../basic-config/model"
import { createOrganizationalUnitsDeploymentPlan } from "./create-organizational-units-deployment-plan"
import {
  OrganizationalUnitsDeploymentPlan,
  PlannedOrganizationalUnit,
} from "./model"

interface PlanOrganizationalUnitsDeployProps {
  readonly organizationState: OrganizationState
  readonly ctx: OrganizationContext
  readonly logger: TkmLogger
  readonly organizationBasicConfigPlan: OrganizationBasicConfigDeploymentPlan
}

export const planOrganizationalUnitsDeploy = async (
  props: PlanOrganizationalUnitsDeployProps,
): Promise<OrganizationalUnitsDeploymentPlan> => {
  const { organizationState, ctx, organizationBasicConfigPlan, logger } = props

  const { rootOrganizationalUnit } = organizationState

  const configFile = ctx.organizationConfig
  const {
    organizationalUnits: { Root },
  } = configFile

  const root = createOrganizationalUnitsDeploymentPlan(
    logger,
    organizationBasicConfigPlan.enabledPolicies,
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
