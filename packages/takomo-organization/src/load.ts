import { DetailedPolicy } from "@takomo/aws-clients"
import { Constants } from "@takomo/core"
import { Logger } from "@takomo/util"
import { PolicyId, PolicyName } from "aws-sdk/clients/organizations"
import { OrganizationContext } from "./context"
import { OrganizationData } from "./model"

const collectPoliciesByTargetId = (
  policies: DetailedPolicy[],
): Map<string, PolicyId[]> => {
  const map = new Map<string, PolicyName[]>()
  policies.forEach(({ policy, targets }) => {
    targets.forEach((target) => {
      const policyIds = map.get(target.TargetId!)
      if (policyIds) {
        policyIds.push(policy.PolicySummary!.Name!)
      } else {
        map.set(target.TargetId!, [policy.PolicySummary!.Name!])
      }
    })
  })
  return map
}

export const loadOrganizationData = async (
  ctx: OrganizationContext,
  logger: Logger,
): Promise<OrganizationData> => {
  const client = ctx.getClient()

  logger.info("Load organization data")

  const currentOrganization = await client.describeOrganization()
  const allFeaturesEnabled = currentOrganization.FeatureSet === "ALL"

  const [
    tagPolicies,
    serviceControlPolicies,
    aiServicesOptOutPolicies,
    existingRoots,
    currentAccounts,
    awsServices,
    organizationRoots,
  ] = await Promise.all([
    client.listDetailedPolicies(Constants.TAG_POLICY_TYPE),
    client.listDetailedPolicies(Constants.SERVICE_CONTROL_POLICY_TYPE),
    client.listDetailedPolicies(Constants.AISERVICES_OPT_OUT_POLICY_TYPE),
    client.listAllOrganizationUnitsWithDetails(),
    client.listAccounts(),
    allFeaturesEnabled ? client.listAWSServiceAccessForOrganization() : [],
    client.listOrganizationRoots(),
  ])

  const currentServiceControlPolicies = serviceControlPolicies.map(
    (p) => p.policy,
  )
  const currentTagPolicies = tagPolicies.map((p) => p.policy)
  const currentAiServicesOptOutPolicies = aiServicesOptOutPolicies.map(
    (p) => p.policy,
  )

  logger.debugObject(
    "Current service control policies:",
    currentServiceControlPolicies,
  )
  logger.debugObject("Current tag policies:", currentTagPolicies)
  logger.debugObject(
    "Current AI services opt-out policies:",
    currentAiServicesOptOutPolicies,
  )
  logger.debugObject("Trusted AWS services:", awsServices)

  const currentRootOrganizationalUnit = existingRoots.find(
    (r) => r.ou.Name === "Root",
  )!
  const currentTrustedAwsServices = awsServices.map((s) => s.ServicePrincipal!)

  const currentServiceControlPoliciesByTarget = collectPoliciesByTargetId(
    serviceControlPolicies,
  )
  const currentTagPoliciesByTarget = collectPoliciesByTargetId(tagPolicies)
  const currentAiServicesOptOutPoliciesByTarget = collectPoliciesByTargetId(
    aiServicesOptOutPolicies,
  )

  const currentEnabledPolicies = organizationRoots[0]
    .PolicyTypes!.filter((p) => p.Status === "ENABLED")
    .map((p) => p.Type!)

  const currentOrganizationHasAllFeaturesEnabled =
    currentOrganization.FeatureSet === "ALL"

  return {
    currentServiceControlPolicies,
    currentTagPolicies,
    currentAiServicesOptOutPolicies,
    currentServiceControlPoliciesByTarget,
    currentTagPoliciesByTarget,
    currentAiServicesOptOutPoliciesByTarget,
    currentRootOrganizationalUnit,
    currentAccounts,
    currentTrustedAwsServices,
    currentEnabledPolicies,
    currentOrganization,
    currentOrganizationHasAllFeaturesEnabled,
  }
}
