import {
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import path from "path"
import { createPoliciesDeploymentPlan } from "./create-policies-deployment-plan"
import { PolicyDeploymentPlan } from "./model"

export const planPoliciesDeployment = async (
  ctx: OrganizationContext,
  organizationState: OrganizationState,
): Promise<PolicyDeploymentPlan> => {
  const logger = ctx.getLogger()

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

  const organizationConfigFile = ctx.getOrganizationConfigFile()
  const options = ctx.getOptions()
  const organizationDir = path.join(options.getProjectDir(), "organization")
  const {
    serviceControlPolicies,
    tagPolicies,
    aiServicesOptOutPolicies,
    backupPolicies,
  } = organizationConfigFile

  return createPoliciesDeploymentPlan(
    organizationDir,
    organizationState,
    serviceControlPolicies,
    tagPolicies,
    aiServicesOptOutPolicies,
    backupPolicies,
  )
}
