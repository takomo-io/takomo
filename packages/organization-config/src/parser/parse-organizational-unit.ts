import { IamRoleName, OrganizationPolicyName } from "@takomo/aws-model"
import { ConfigSetInstruction } from "@takomo/config-sets"
import { parseStringArray, parseVars, Vars } from "@takomo/core"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { merge, TkmLogger } from "@takomo/util"
import R from "ramda"
import { OrganizationalUnitConfig } from "../model"
import { findMissingDirectChildrenPaths } from "./find-missing-direct-child-paths"
import { mergeConfigSetInstructions } from "./merge-config-set-instructions"
import { parseAccounts } from "./parse-accounts"
import { parseConfigSetInstructions } from "./parse-config-set-instructions"
import { parseOrganizationalUnitStatus } from "./parse-organizational-unit-status"

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

interface ParseOrganizationalUnitProps {
  readonly parentLogger: TkmLogger
  readonly externallyLoadedAccounts: Map<
    OrganizationalUnitPath,
    ReadonlyArray<unknown>
  >
  readonly ouPath: OrganizationalUnitPath
  readonly config: any
  readonly inheritedServiceControlPolicies?: ReadonlyArray<OrganizationPolicyName>
  readonly inheritedTagPolicies?: ReadonlyArray<OrganizationPolicyName>
  readonly inheritedAiServicesOptOutPolicies?: ReadonlyArray<OrganizationPolicyName>
  readonly inheritedBackupPolicies?: ReadonlyArray<OrganizationPolicyName>
  readonly inheritedConfigSets?: ReadonlyArray<ConfigSetInstruction>
  readonly inheritedBootstrapConfigSets?: ReadonlyArray<ConfigSetInstruction>
  readonly inheritedVars: Vars
  readonly inheritedAccountAdminRoleName: IamRoleName
  readonly inheritedAccountBootstrapRoleName: IamRoleName
}

export const parseOrganizationalUnit = async ({
  parentLogger,
  externallyLoadedAccounts,
  ouPath,
  config,
  inheritedServiceControlPolicies = [],
  inheritedTagPolicies = [],
  inheritedAiServicesOptOutPolicies = [],
  inheritedBackupPolicies = [],
  inheritedConfigSets = [],
  inheritedBootstrapConfigSets = [],
  inheritedVars,
  inheritedAccountAdminRoleName,
  inheritedAccountBootstrapRoleName,
}: ParseOrganizationalUnitProps): Promise<OrganizationalUnitConfig> => {
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

  const vars = merge(inheritedVars, parseVars(ou?.vars))

  const configuredServiceControlPolicies = parseStringArray(
    ou?.serviceControlPolicies,
  )
  const configuredTagPolicies = parseStringArray(ou?.tagPolicies)
  const configuredAiServicesOptOutPolicies = parseStringArray(
    ou?.aiServicesOptOutPolicies,
  )
  const configuredBackupPolicies = parseStringArray(ou?.backupPolicies)

  const serviceControlPolicies = R.uniq([
    ...configuredServiceControlPolicies,
    ...inheritedServiceControlPolicies,
  ])
  const tagPolicies = R.uniq([
    ...configuredTagPolicies,
    ...inheritedTagPolicies,
  ])
  const aiServicesOptOutPolicies = R.uniq([
    ...configuredAiServicesOptOutPolicies,
    ...inheritedAiServicesOptOutPolicies,
  ])

  const backupPolicies = R.uniq([
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

  const configuredConfigSets = parseConfigSetInstructions(ou?.configSets)
  const configSets = mergeConfigSetInstructions(
    configuredConfigSets,
    inheritedConfigSets,
  )

  const configuredBootstrapConfigSets = parseConfigSetInstructions(
    ou?.bootstrapConfigSets,
  )
  const bootstrapConfigSets = mergeConfigSetInstructions(
    configuredBootstrapConfigSets,
    inheritedBootstrapConfigSets,
  )

  const accountAdminRoleName =
    ou?.accountAdminRoleName ?? inheritedAccountAdminRoleName
  const accountBootstrapRoleName =
    ou?.accountBootstrapRoleName ?? inheritedAccountBootstrapRoleName

  const children = await Promise.all(
    [...missingDirectChildPaths, ...directChildPaths].map(async (childPath) =>
      parseOrganizationalUnit({
        parentLogger: logger,
        externallyLoadedAccounts,
        ouPath: childPath,
        config,
        inheritedServiceControlPolicies: serviceControlPolicies.slice(),
        inheritedTagPolicies: tagPolicies.slice(),
        inheritedAiServicesOptOutPolicies: aiServicesOptOutPolicies.slice(),
        inheritedBackupPolicies: backupPolicies.slice(),
        inheritedConfigSets: configSets.slice(),
        inheritedBootstrapConfigSets: bootstrapConfigSets.slice(),
        inheritedVars: vars,
        inheritedAccountAdminRoleName,
        inheritedAccountBootstrapRoleName,
      }),
    ),
  )

  const externalAccounts = externallyLoadedAccounts.get(ouPath) ?? []
  const allAccount = [...(ou?.accounts ?? []), ...externalAccounts]

  const accounts = parseAccounts({
    value: allAccount,
    inheritedConfigSets: configSets,
    inheritedBootstrapConfigSets: bootstrapConfigSets,
    inheritedServiceControlPolicies: serviceControlPolicies,
    inheritedTagPolicies: tagPolicies,
    inheritedAiServicesOptOutPolicies: aiServicesOptOutPolicies,
    inheritedBackupPolicies: backupPolicies,
    inheritedVars: vars,
    inheritedAccountAdminRoleName,
    inheritedAccountBootstrapRoleName,
  })

  return {
    name,
    children,
    accounts,
    policies,
    configSets,
    bootstrapConfigSets,
    path: ouPath,
    description: ou?.description ?? null,
    priority: ou?.priority ?? 0,
    accountAdminRoleName,
    accountBootstrapRoleName,
    vars,
    status: parseOrganizationalUnitStatus(ou?.status),
  }
}
