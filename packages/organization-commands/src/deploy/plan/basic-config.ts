import { Constants } from "@takomo/core"
import {
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import intersection from "lodash.intersection"
import without from "lodash.without"
import { OrganizationBasicConfigDeploymentPlan } from "./model"

export const planOrganizationBasicConfigDeployment = async (
  ctx: OrganizationContext,
  organizationState: OrganizationState,
): Promise<OrganizationBasicConfigDeploymentPlan> => {
  const {
    allFeaturesEnabled,
    trustedAwsServices,
    enabledPolicies,
  } = organizationState
  const logger = ctx.getLogger()

  const configFile = ctx.getOrganizationConfigFile()

  if (!allFeaturesEnabled) {
    logger.debug(
      "Organization does not have all features enabled, skip basic config deployment planning",
    )
    return {
      skip: true,
      hasChanges: false,
      enabledPolicies: {
        add: [],
        retain: [],
        remove: [],
      },
      trustedServices: {
        add: [],
        retain: [],
        remove: [],
      },
    }
  }

  const localTrustedAwsServices =
    configFile.trustedAwsServices || Constants.ORGANIZATION_SERVICE_PRINCIPALS
  const localEnabledPolicies = new Array<string>()

  if (configFile.serviceControlPolicies.enabled) {
    localEnabledPolicies.push(Constants.SERVICE_CONTROL_POLICY_TYPE)
  }
  if (configFile.tagPolicies.enabled) {
    localEnabledPolicies.push(Constants.TAG_POLICY_TYPE)
  }
  if (configFile.aiServicesOptOutPolicies.enabled) {
    localEnabledPolicies.push(Constants.AISERVICES_OPT_OUT_POLICY_TYPE)
  }
  if (configFile.backupPolicies.enabled) {
    localEnabledPolicies.push(Constants.BACKUP_POLICY_TYPE)
  }

  const trustedServicesToAdd = without(
    localTrustedAwsServices,
    ...trustedAwsServices,
  )
  const trustedServiceToRemove = without(
    trustedAwsServices,
    ...localTrustedAwsServices,
  )
  const trustedServicesToRetain = intersection(
    localTrustedAwsServices,
    trustedAwsServices,
  )

  const policiesToAdd = without(localEnabledPolicies, ...enabledPolicies)
  const policiesToRemove = without(enabledPolicies, ...localEnabledPolicies)
  const policiesToRetain = intersection(localEnabledPolicies, enabledPolicies)

  const hasChanges =
    [
      ...trustedServicesToAdd,
      ...trustedServiceToRemove,
      ...policiesToAdd,
      ...policiesToRemove,
    ].length > 0

  return {
    hasChanges,
    skip: false,
    enabledPolicies: {
      add: policiesToAdd,
      retain: policiesToRetain,
      remove: policiesToRemove,
    },
    trustedServices: {
      add: trustedServicesToAdd,
      retain: trustedServicesToRetain,
      remove: trustedServiceToRemove,
    },
  }
}
