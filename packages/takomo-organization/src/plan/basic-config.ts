import { Constants } from "@takomo/core"
import intersection from "lodash.intersection"
import without from "lodash.without"
import { OrganizationContext } from "../context"
import {
  OrganizationBasicConfigDeploymentPlan,
  OrganizationData,
} from "../model"

export const planOrganizationBasicConfigDeployment = async (
  ctx: OrganizationContext,
  data: OrganizationData,
): Promise<OrganizationBasicConfigDeploymentPlan> => {
  const {
    currentOrganizationHasAllFeaturesEnabled,
    currentTrustedAwsServices,
    currentEnabledPolicies,
  } = data
  const logger = ctx.getLogger()

  const configFile = ctx.getOrganizationConfigFile()

  if (!currentOrganizationHasAllFeaturesEnabled) {
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

  const trustedServicesToAdd = without(
    localTrustedAwsServices,
    ...currentTrustedAwsServices,
  )
  const trustedServiceToRemove = without(
    currentTrustedAwsServices,
    ...localTrustedAwsServices,
  )
  const trustedServicesToRetain = intersection(
    localTrustedAwsServices,
    currentTrustedAwsServices,
  )

  const policiesToAdd = without(localEnabledPolicies, ...currentEnabledPolicies)
  const policiesToRemove = without(
    currentEnabledPolicies,
    ...localEnabledPolicies,
  )
  const policiesToRetain = intersection(
    localEnabledPolicies,
    currentEnabledPolicies,
  )

  const trustedServicesChanged =
    [...trustedServicesToAdd, ...trustedServiceToRemove].length > 0
  const enabledPoliciesChanged =
    [...policiesToAdd, ...policiesToRemove].length > 0
  const hasChanges = trustedServicesChanged || enabledPoliciesChanged

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
