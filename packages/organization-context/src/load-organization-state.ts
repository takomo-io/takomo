import { DetailedOrganizationalUnit, DetailedPolicy } from "@takomo/aws-clients"
import { Constants } from "@takomo/core"
import { arrayToMap, collectFromHierarchy, Logger } from "@takomo/util"
import {
  EnabledServicePrincipal,
  OrganizationalUnitId,
  Policy,
  PolicyId,
  PolicyName,
  Root,
} from "aws-sdk/clients/organizations"
import { OrgEntityId } from "./model"
import { OrganizationContext } from "./organization-context"
import {
  OrganizationState,
  PoliciesByTypeByName,
  PoliciesByTypeByTargetMap,
} from "./organization-state"

const collectPoliciesByTargetId = (
  policies: DetailedPolicy[],
): Map<OrgEntityId, PolicyId[]> => {
  const map = new Map<OrgEntityId, PolicyName[]>()
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

const collectPolicies = (detailedPolicies: DetailedPolicy[]): Policy[] =>
  detailedPolicies.map((p) => p.policy)

const getRootOrganizationalUnit = (
  roots: DetailedOrganizationalUnit[],
): DetailedOrganizationalUnit => {
  const root = roots.find((r) => r.ou.Name === "Root")
  if (!root) {
    throw new Error("Could not load root organizational unit")
  }

  return root
}

const collectTrustedAwsServices = (
  principals: EnabledServicePrincipal[],
): string[] => principals.map((s) => s.ServicePrincipal!)

const collectEnabledPolicies = (roots: Root[]): string[] =>
  roots[0]
    .PolicyTypes!.filter((p) => p.Status === "ENABLED")
    .map((p) => p.Type!)

const buildParentByTargetIdMap = (
  ou: DetailedOrganizationalUnit,
  map: Map<OrgEntityId, OrgEntityId> = new Map(),
): Map<OrgEntityId, OrgEntityId> => {
  const id = ou.ou.Id!

  ou.accounts.forEach((account) => {
    map.set(account.Id!, id)
  })

  ou.children.forEach((child) => {
    map.set(child.ou.Id!, id)
    buildParentByTargetIdMap(child, map)
  })

  return map
}

const getPolicyName = (policy: Policy): PolicyName =>
  policy.PolicySummary?.Name!

const buildPoliciesByTypeByNameMap = (
  serviceControlPolicies: Policy[],
  tagPolicies: Policy[],
  aiServicesOptOutPolicies: Policy[],
  backupPolicies: Policy[],
): PoliciesByTypeByName =>
  new Map([
    [
      Constants.SERVICE_CONTROL_POLICY_TYPE,
      arrayToMap(serviceControlPolicies, getPolicyName),
    ],
    [Constants.TAG_POLICY_TYPE, arrayToMap(tagPolicies, getPolicyName)],
    [
      Constants.AISERVICES_OPT_OUT_POLICY_TYPE,
      arrayToMap(aiServicesOptOutPolicies, getPolicyName),
    ],
    [Constants.BACKUP_POLICY_TYPE, arrayToMap(backupPolicies, getPolicyName)],
  ])

const buildPoliciesByTypeByTargetMap = (
  serviceControlPolicies: Map<OrgEntityId, PolicyId[]>,
  tagPolicies: Map<OrgEntityId, PolicyId[]>,
  aiServicesOptOutPolicies: Map<OrgEntityId, PolicyId[]>,
  backupPolicies: Map<OrgEntityId, PolicyId[]>,
): PoliciesByTypeByTargetMap =>
  new Map([
    [Constants.SERVICE_CONTROL_POLICY_TYPE, serviceControlPolicies],
    [Constants.TAG_POLICY_TYPE, tagPolicies],
    [Constants.AISERVICES_OPT_OUT_POLICY_TYPE, aiServicesOptOutPolicies],
    [Constants.BACKUP_POLICY_TYPE, backupPolicies],
  ])

const buildOrganizationalUnitsByIdMap = (
  root: DetailedOrganizationalUnit,
): Map<OrganizationalUnitId, DetailedOrganizationalUnit> => {
  const ous = collectFromHierarchy(root, (ou) => ou.children)
  return arrayToMap(ous, (ou) => ou.ou.Id!)
}

export const loadOrganizationState = async (
  ctx: OrganizationContext,
  logger: Logger,
): Promise<OrganizationState> => {
  logger.info("Load organization state")

  const client = ctx.getClient()
  const organization = await client.describeOrganization()

  const allFeaturesEnabled = organization.FeatureSet === "ALL"

  const [
    detailedTagPolicies,
    detailedServiceControlPolicies,
    detailedAiServicesOptOutPolicies,
    detailedBackupPolicies,
    existingRoots,
    accounts,
    awsServices,
    organizationRoots,
  ] = await Promise.all([
    client.listDetailedPolicies(Constants.TAG_POLICY_TYPE),
    client.listDetailedPolicies(Constants.SERVICE_CONTROL_POLICY_TYPE),
    client.listDetailedPolicies(Constants.AISERVICES_OPT_OUT_POLICY_TYPE),
    client.listDetailedPolicies(Constants.BACKUP_POLICY_TYPE),
    client.listAllOrganizationUnitsWithDetails(),
    client.listAccounts(),
    allFeaturesEnabled ? client.listAWSServiceAccessForOrganization() : [],
    client.listOrganizationRoots(),
  ])

  const rootOrganizationalUnit = getRootOrganizationalUnit(existingRoots)
  const trustedAwsServices = collectTrustedAwsServices(awsServices)
  const enabledPolicies = collectEnabledPolicies(organizationRoots)

  const policies = [
    detailedServiceControlPolicies,
    detailedTagPolicies,
    detailedAiServicesOptOutPolicies,
    detailedBackupPolicies,
  ]

  const [
    serviceControlPolicies,
    tagPolicies,
    aiServicesOptOutPolicies,
    backupPolicies,
  ] = policies.map(collectPolicies)

  const [
    serviceControlPoliciesByTarget,
    tagPoliciesByTarget,
    aiServicesOptOutPoliciesByTarget,
    backupPoliciesByTarget,
  ] = policies.map(collectPoliciesByTargetId)

  const parentByTargetId = buildParentByTargetIdMap(rootOrganizationalUnit)

  const policiesByTypeByName = buildPoliciesByTypeByNameMap(
    serviceControlPolicies,
    tagPolicies,
    aiServicesOptOutPolicies,
    backupPolicies,
  )

  const policiesByTypeByTarget = buildPoliciesByTypeByTargetMap(
    serviceControlPoliciesByTarget,
    tagPoliciesByTarget,
    aiServicesOptOutPoliciesByTarget,
    backupPoliciesByTarget,
  )

  const organizationalUnitById = buildOrganizationalUnitsByIdMap(
    rootOrganizationalUnit,
  )

  const state = new OrganizationState({
    allFeaturesEnabled,
    accounts,
    enabledPolicies,
    rootOrganizationalUnit,
    organization,
    trustedAwsServices,
    policiesByTypeByName,
    policiesByTypeByTarget,
    parentByTargetId,
    organizationalUnitById,
  })

  logger.debugObject("Organization state: ", state.getAsObject())

  return state
}
