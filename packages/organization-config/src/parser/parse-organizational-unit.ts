import { OrganizationPolicyName } from "@takomo/aws-model"
import { ConfigSetName } from "@takomo/config-sets"
import { parseVars } from "@takomo/core"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { TkmLogger } from "@takomo/util"
import uniq from "lodash.uniq"
import { OrganizationalUnitConfig } from "../model"
import { findMissingDirectChildrenPaths } from "./find-missing-direct-child-paths"
import { parseAccounts } from "./parse-accounts"
import { parseConfigSetNames } from "./parse-config-set-names"
import { parseOrganizationalUnitStatus } from "./parse-organizational-unit-status"
import { parsePolicyNames } from "./parse-policy-names"

const extractOrganizationalUnitName = (
  ouPath: OrganizationalUnitPath,
): string => ouPath.split("/").reverse()[0]

const resolveOrganizationalUnitDepth = (
  ouPath: OrganizationalUnitPath,
): number => ouPath.split("/").length

const collectChildPaths = (
  ouPath: OrganizationalUnitPath,
  config: any,
): ReadonlyArray<OrganizationalUnitPath> =>
  Object.keys(config).filter((key) => key.startsWith(`${ouPath}/`))

const collectDirectChildPaths = (
  ouPathDepth: number,
  childPaths: ReadonlyArray<OrganizationalUnitPath>,
): ReadonlyArray<OrganizationalUnitPath> =>
  childPaths.filter(
    (key) => resolveOrganizationalUnitDepth(key) === ouPathDepth + 1,
  )

export const parseOrganizationalUnit = async (
  parentLogger: TkmLogger,
  externallyLoadedAccounts: Map<OrganizationalUnitPath, ReadonlyArray<unknown>>,
  ouPath: OrganizationalUnitPath,
  config: any,
  inheritedServiceControlPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedTagPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedAiServicesOptOutPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedBackupPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetName>,
): Promise<OrganizationalUnitConfig> => {
  const name = extractOrganizationalUnitName(ouPath)
  const ouPathDepth = resolveOrganizationalUnitDepth(ouPath)

  const logger = parentLogger.childLogger(name)
  logger.debugObject("Parsing ou:", { path: ouPath, name, depth: ouPathDepth })

  const childPaths = collectChildPaths(ouPath, config)
  logger.debugObject("Child paths:", childPaths)

  const directChildPaths = collectDirectChildPaths(ouPathDepth, childPaths)
  logger.debugObject("Direct child paths:", directChildPaths)

  const missingDirectChildPaths = findMissingDirectChildrenPaths(
    childPaths,
    ouPathDepth,
  )
  logger.debugObject("Missing direct child paths:", missingDirectChildPaths)

  const ou = config[ouPath]
  const configuredServiceControlPolicies = parsePolicyNames(
    ou?.serviceControlPolicies,
  )
  const configuredTagPolicies = parsePolicyNames(ou?.tagPolicies)
  const configuredAiServicesOptOutPolicies = parsePolicyNames(
    ou?.aiServicesOptOutPolicies,
  )
  const configuredBackupPolicies = parsePolicyNames(ou?.backupPolicies)

  const serviceControlPolicies = uniq([
    ...configuredServiceControlPolicies,
    ...inheritedServiceControlPolicies,
  ])
  const tagPolicies = uniq([...configuredTagPolicies, ...inheritedTagPolicies])
  const aiServicesOptOutPolicies = uniq([
    ...configuredAiServicesOptOutPolicies,
    ...inheritedAiServicesOptOutPolicies,
  ])

  const backupPolicies = uniq([
    ...configuredBackupPolicies,
    ...inheritedBackupPolicies,
  ])

  const policies = {
    serviceControl: {
      inherited: inheritedServiceControlPolicies,
      // Each organizational unit must have at least one service control policy attached at all times.
      // Therefore we attach the first inherited policy if the ou doesn't have a policy attached directly.
      attached:
        configuredServiceControlPolicies.length > 0
          ? configuredServiceControlPolicies
          : inheritedServiceControlPolicies.slice(0, 1),
    },
    tag: {
      inherited: inheritedTagPolicies,
      attached: configuredTagPolicies,
    },
    backup: {
      inherited: inheritedBackupPolicies,
      attached: configuredBackupPolicies,
    },
    aiServicesOptOut: {
      inherited: inheritedAiServicesOptOutPolicies,
      attached: configuredAiServicesOptOutPolicies,
    },
  }

  const configuredConfigSets = parseConfigSetNames(ou?.configSets)
  const configSets = uniq([...configuredConfigSets, ...inheritedConfigSets])

  const configuredBootstrapConfigSets = parseConfigSetNames(
    ou?.bootstrapConfigSets,
  )
  const bootstrapConfigSets = uniq([
    ...configuredBootstrapConfigSets,
    ...inheritedBootstrapConfigSets,
  ])

  const children = await Promise.all(
    [...missingDirectChildPaths, ...directChildPaths].map(async (childPath) =>
      parseOrganizationalUnit(
        logger,
        externallyLoadedAccounts,
        childPath,
        config,
        serviceControlPolicies.slice(),
        tagPolicies.slice(),
        aiServicesOptOutPolicies.slice(),
        backupPolicies.slice(),
        configSets.slice(),
        bootstrapConfigSets.slice(),
      ),
    ),
  )

  const externalAccounts = externallyLoadedAccounts.get(ouPath) ?? []
  const allAccount = [...(ou?.accounts ?? []), ...externalAccounts]

  const accounts = parseAccounts(
    allAccount,
    configSets,
    bootstrapConfigSets,
    serviceControlPolicies,
    tagPolicies,
    aiServicesOptOutPolicies,
    backupPolicies,
  )

  return {
    name,
    children,
    accounts,
    policies,
    configSets,
    bootstrapConfigSets,
    path: ouPath,
    description: ou?.description || null,
    priority: ou?.priority || 0,
    accountAdminRoleName: ou?.accountAdminRoleName || null,
    accountBootstrapRoleName: ou?.accountBootstrapRoleName || null,
    vars: parseVars(ou?.vars),
    status: parseOrganizationalUnitStatus(ou?.status),
  }
}
