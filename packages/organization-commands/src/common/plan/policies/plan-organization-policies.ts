import {
  OrganizationConfigRepository,
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { TkmLogger } from "@takomo/util"
import { createPoliciesDeploymentPlan } from "./create-policies-deployment-plan"
import { PolicyDeploymentPlan } from "./model"

interface PlanOrganizationPoliciesProps {
  readonly organizationState: OrganizationState
  readonly ctx: OrganizationContext
  readonly logger: TkmLogger
  readonly configRepository: OrganizationConfigRepository
}

export const planOrganizationPolicies = async (
  props: PlanOrganizationPoliciesProps,
): Promise<PolicyDeploymentPlan> => {
  const { organizationState, ctx, logger, configRepository } = props

  if (!organizationState.allFeaturesEnabled) {
    logger.debug(
      "Organization does not have all features enabled, skip policies deployment planning",
    )
    return {
      skip: true,
      hasChanges: false,
      tag: {
        add: [],
        remove: [],
        skip: [],
        update: [],
      },
      serviceControl: {
        add: [],
        remove: [],
        skip: [],
        update: [],
      },
      aiServicesOptOut: {
        add: [],
        remove: [],
        skip: [],
        update: [],
      },
      backup: {
        add: [],
        remove: [],
        skip: [],
        update: [],
      },
    }
  }

  const organizationConfigFile = ctx.organizationConfig
  const {
    serviceControlPolicies,
    tagPolicies,
    aiServicesOptOutPolicies,
    backupPolicies,
  } = organizationConfigFile

  return createPoliciesDeploymentPlan(
    configRepository,
    organizationState,
    serviceControlPolicies,
    tagPolicies,
    aiServicesOptOutPolicies,
    backupPolicies,
  )
}
