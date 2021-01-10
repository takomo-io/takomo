import {
  DetailedOrganizationalUnit,
  DetailedOrganizationPolicy,
  OrganizationalUnitId,
  OrganizationPolicy,
  OrganizationPolicyId,
  OrganizationPolicyName,
  OrganizationPolicyType,
  OrganizationRoot,
} from "@takomo/aws-model"
import { arrayToMap, collectFromHierarchy, TkmLogger } from "@takomo/util"
import { OrgEntityId } from "./model"
import { OrganizationContext } from "./organization-context"
import {
  OrganizationState,
  PoliciesByTypeByName,
  PoliciesByTypeByTargetMap,
} from "./organization-state"

const collectPoliciesByTargetId = (
  policies: ReadonlyArray<DetailedOrganizationPolicy>,
): Map<OrgEntityId, ReadonlyArray<OrganizationPolicyId>> => {
  const map = new Map<OrgEntityId, Array<OrganizationPolicyName>>()
  policies.forEach(({ policy, targets }) => {
    targets.forEach((target) => {
      const policyIds = map.get(target.targetId)
      if (policyIds) {
        policyIds.push(policy.summary.name)
      } else {
        map.set(target.targetId, [policy.summary.name])
      }
    })
  })
  return map
}

const collectPolicies = (
  detailedPolicies: ReadonlyArray<DetailedOrganizationPolicy>,
): ReadonlyArray<OrganizationPolicy> => detailedPolicies.map((p) => p.policy)

const getRootOrganizationalUnit = (
  roots: ReadonlyArray<DetailedOrganizationalUnit>,
): DetailedOrganizationalUnit => {
  const root = roots.find((r) => r.ou.name === "Root")
  if (!root) {
    throw new Error("Could not load root organizational unit")
  }

  return root
}

const collectEnabledPolicies = (
  roots: ReadonlyArray<OrganizationRoot>,
): ReadonlyArray<OrganizationPolicyType> =>
  roots[0].policyTypes.filter((p) => p.status === "ENABLED").map((p) => p.type)

const buildParentByTargetIdMap = (
  ou: DetailedOrganizationalUnit,
  map: Map<OrgEntityId, OrgEntityId> = new Map(),
): Map<OrgEntityId, OrgEntityId> => {
  const id = ou.ou.id

  ou.accounts.forEach((account) => {
    map.set(account.id, id)
  })

  ou.children.forEach((child) => {
    map.set(child.ou.id, id)
    buildParentByTargetIdMap(child, map)
  })

  return map
}

const getPolicyName = (policy: OrganizationPolicy): OrganizationPolicyName =>
  policy.summary.name

const buildPoliciesByTypeByNameMap = (
  serviceControlPolicies: ReadonlyArray<OrganizationPolicy>,
  tagPolicies: ReadonlyArray<OrganizationPolicy>,
  aiServicesOptOutPolicies: ReadonlyArray<OrganizationPolicy>,
  backupPolicies: ReadonlyArray<OrganizationPolicy>,
): PoliciesByTypeByName =>
  new Map([
    [
      "SERVICE_CONTROL_POLICY",
      arrayToMap(serviceControlPolicies, getPolicyName),
    ],
    ["TAG_POLICY", arrayToMap(tagPolicies, getPolicyName)],
    [
      "AISERVICES_OPT_OUT_POLICY",
      arrayToMap(aiServicesOptOutPolicies, getPolicyName),
    ],
    ["BACKUP_POLICY", arrayToMap(backupPolicies, getPolicyName)],
  ])

const buildPoliciesByTypeByTargetMap = (
  serviceControlPolicies: Map<OrgEntityId, ReadonlyArray<OrganizationPolicyId>>,
  tagPolicies: Map<OrgEntityId, ReadonlyArray<OrganizationPolicyId>>,
  aiServicesOptOutPolicies: Map<
    OrgEntityId,
    ReadonlyArray<OrganizationPolicyId>
  >,
  backupPolicies: Map<OrgEntityId, ReadonlyArray<OrganizationPolicyId>>,
): PoliciesByTypeByTargetMap =>
  new Map([
    ["SERVICE_CONTROL_POLICY", serviceControlPolicies],
    ["TAG_POLICY", tagPolicies],
    ["AISERVICES_OPT_OUT_POLICY", aiServicesOptOutPolicies],
    ["BACKUP_POLICY", backupPolicies],
  ])

const buildOrganizationalUnitsByIdMap = (
  root: DetailedOrganizationalUnit,
): Map<OrganizationalUnitId, DetailedOrganizationalUnit> => {
  const ous = collectFromHierarchy(root, (ou) => ou.children)
  return arrayToMap(ous, (ou) => ou.ou.id)
}

export const loadOrganizationState = async (
  ctx: OrganizationContext,
  logger: TkmLogger,
): Promise<OrganizationState> => {
  logger.info("Load organization state")

  const client = ctx.getClient()
  const organization = await client.describeOrganization()

  const allFeaturesEnabled = organization.featureSet === "ALL"

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
    client.listDetailedPolicies("TAG_POLICY"),
    client.listDetailedPolicies("SERVICE_CONTROL_POLICY"),
    client.listDetailedPolicies("AISERVICES_OPT_OUT_POLICY"),
    client.listDetailedPolicies("BACKUP_POLICY"),
    client.listAllOrganizationUnitsWithDetails(),
    client.listAccounts(),
    allFeaturesEnabled ? client.listAWSServiceAccessForOrganization() : [],
    client.listOrganizationRoots(),
  ])

  const rootOrganizationalUnit = getRootOrganizationalUnit(existingRoots)
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
    trustedAwsServices: awsServices,
    policiesByTypeByName,
    policiesByTypeByTarget,
    parentByTargetId,
    organizationalUnitById,
  })

  logger.debugObject("Organization state: ", state.getAsObject())

  return state
}
