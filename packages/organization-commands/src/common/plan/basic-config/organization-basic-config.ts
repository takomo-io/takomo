import { OrganizationPolicyType } from "@takomo/aws-model"
import {
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { TkmLogger } from "@takomo/util"
import intersection from "lodash.intersection"
import without from "lodash.without"
import { OrganizationBasicConfigDeploymentPlan } from "./model"

interface PlanOrganizationBasicConfigProps {
  readonly organizationState: OrganizationState
  readonly ctx: OrganizationContext
  readonly logger: TkmLogger
}

export const planOrganizationBasicConfig = async (
  props: PlanOrganizationBasicConfigProps,
): Promise<OrganizationBasicConfigDeploymentPlan> => {
  const { organizationState, ctx, logger } = props

  const {
    allFeaturesEnabled,
    trustedAwsServices,
    enabledPolicies,
  } = organizationState

  const config = ctx.organizationConfig

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
    config.trustedAwsServices || ctx.organizationServicePrincipals
  const localEnabledPolicies = new Array<OrganizationPolicyType>()

  if (config.serviceControlPolicies.enabled) {
    localEnabledPolicies.push("SERVICE_CONTROL_POLICY")
  }
  if (config.tagPolicies.enabled) {
    localEnabledPolicies.push("TAG_POLICY")
  }
  if (config.aiServicesOptOutPolicies.enabled) {
    localEnabledPolicies.push("AISERVICES_OPT_OUT_POLICY")
  }
  if (config.backupPolicies.enabled) {
    localEnabledPolicies.push("BACKUP_POLICY")
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
