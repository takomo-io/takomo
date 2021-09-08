import {
  OrganizationConfigRepository,
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { TakomoError, TkmLogger } from "@takomo/util"
import { planOrganizationBasicConfig } from "../../common/plan/basic-config/organization-basic-config"
import { planOrganizationalUnitsDeploy } from "../../common/plan/organizational-units/plan-organizational-units-deploy"
import { planOrganizationPolicies } from "../../common/plan/policies/plan-organization-policies"

export interface ValidateOrganizationConfigIsInSyncWithRemoteStateProps {
  readonly organizationState: OrganizationState
  readonly ctx: OrganizationContext
  readonly logger: TkmLogger
  readonly configRepository: OrganizationConfigRepository
}

export const validateOrganizationConfigIsInSyncWithRemoteState = async ({
  organizationState,
  ctx,
  logger,
  configRepository,
}: ValidateOrganizationConfigIsInSyncWithRemoteStateProps): Promise<void> => {
  const basicConfigPlan = await planOrganizationBasicConfig({
    ctx,
    logger,
    organizationState,
  })

  logger.traceObject("Basic plan", basicConfigPlan)

  const organizationalUnitsPlan = await planOrganizationalUnitsDeploy({
    ctx,
    basicConfigPlan,
    organizationState,
    logger,
  })

  logger.traceObject("Organizational units plan", organizationalUnitsPlan)

  const policiesPlan = await planOrganizationPolicies({
    logger,
    configRepository,
    ctx,
    organizationState,
  })

  logger.traceObject("Policies plan", policiesPlan)

  if (
    policiesPlan.hasChanges ||
    organizationalUnitsPlan.hasChanges ||
    basicConfigPlan.hasChanges
  ) {
    throw new TakomoError(
      `Local configuration does not match with the current organization state`,
    )
  }
}
