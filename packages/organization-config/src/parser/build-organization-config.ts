import { AccountId } from "@takomo/aws-model"
import {
  ConfigSet,
  ConfigSetName,
  mergeConfigSets,
  parseConfigSets,
} from "@takomo/config-sets"
import {
  CommandContext,
  parseOptionalString,
  parseOptionalStringArray,
  parseString,
  parseVars,
} from "@takomo/core"
import {
  DEFAULT_ORGANIZATION_ROLE_NAME,
  OrganizationalUnitPath,
} from "@takomo/organization-model"
import { buildOrganizationConfigSchema } from "@takomo/organization-schema"
import {
  collectFromHierarchy,
  deepCopy,
  findNonUniques,
  TkmLogger,
  ValidationError,
} from "@takomo/util"
import merge from "lodash.merge"
import { err, ok, Result } from "neverthrow"
import R from "ramda"
import { OrganizationalUnitConfig, OrganizationConfig } from "../model"
import { getAccountIds, getOUPaths } from "../util"
import { parseAccountCreationConfig } from "./parse-account-creation-config"
import { parseOrganizationalUnitsConfig } from "./parse-organizational-units-config"
import { parsePoliciesConfig } from "./parse-policies-config"

interface BuildOrganizationConfigProps {
  readonly logger: TkmLogger
  readonly ctx: CommandContext
  readonly externallyLoadedAccounts: Map<
    OrganizationalUnitPath,
    ReadonlyArray<unknown>
  >
  readonly externalConfigSets: Map<ConfigSetName, ConfigSet>
  readonly record: Record<string, unknown>
}

const getIdsOfExternallyLoadedAccounts = (
  externallyLoadedAccounts: Map<OrganizationalUnitPath, ReadonlyArray<unknown>>,
): ReadonlyArray<AccountId> =>
  Array.from(externallyLoadedAccounts.values())
    .map((accounts) => accounts.map((a) => (a as any).id as AccountId))
    .flat()

const getConfiguredAccountIds = (
  ous: ReadonlyArray<OrganizationalUnitConfig>,
): ReadonlyArray<AccountId> =>
  getAccountIds(ous.map((ou) => ou.accounts).flat())

export const buildOrganizationConfig = async (
  props: BuildOrganizationConfigProps,
): Promise<Result<OrganizationConfig, ValidationError>> => {
  const { logger, ctx, externallyLoadedAccounts, externalConfigSets, record } =
    props

  const externalAccountIds = getIdsOfExternallyLoadedAccounts(
    externallyLoadedAccounts,
  )

  const nonUniqueExternalAccountIds = findNonUniques(externalAccountIds)
  if (nonUniqueExternalAccountIds.length > 0) {
    const details = nonUniqueExternalAccountIds.map(
      (d) =>
        `Account '${d}' is specified more than once in the externally configured accounts`,
    )
    return err(
      new ValidationError(
        "Validation errors in organization configuration.",
        details,
      ),
    )
  }

  const organizationConfigFileSchema = buildOrganizationConfigSchema({
    regions: ctx.regions,
  })

  const { error } = organizationConfigFileSchema.validate(record, {
    abortEarly: false,
  })

  if (error) {
    const details = error.details.map((d) => d.message)
    return err(
      new ValidationError(
        "Validation errors in organization configuration",
        details,
      ),
    )
  }

  const organizationAdminRoleName = parseOptionalString(
    record.organizationAdminRoleName,
  )
  const accountAdminRoleName = parseString(
    record.accountAdminRoleName,
    DEFAULT_ORGANIZATION_ROLE_NAME,
  )
  const accountBootstrapRoleName = parseString(
    record.accountBootstrapAdminRoleName,
    DEFAULT_ORGANIZATION_ROLE_NAME,
  )

  const accountCreation = parseAccountCreationConfig(
    record.accountCreation,
    accountAdminRoleName,
  )
  const parsedConfigSets = parseConfigSets(record.configSets)
  const configSets = mergeConfigSets(parsedConfigSets, externalConfigSets)
  const stages = parseOptionalStringArray(record.stages) ?? ["default"]

  const serviceControlPolicies = parsePoliciesConfig(
    "SERVICE_CONTROL_POLICY",
    record.serviceControlPolicies,
  )
  const tagPolicies = parsePoliciesConfig("TAG_POLICY", record.tagPolicies)
  const aiServicesOptOutPolicies = parsePoliciesConfig(
    "AISERVICES_OPT_OUT_POLICY",
    record.aiServicesOptOutPolicies,
  )
  const backupPolicies = parsePoliciesConfig(
    "BACKUP_POLICY",
    record.backupPolicies,
  )

  const vars = parseVars(record.vars)
  merge(deepCopy(ctx.variables.var), vars)

  const organizationalUnits = await parseOrganizationalUnitsConfig(
    logger,
    externallyLoadedAccounts,
    record.organizationalUnits,
    vars,
    accountAdminRoleName,
    accountBootstrapRoleName,
  )

  const configuredOUs = collectFromHierarchy(
    organizationalUnits.Root,
    R.prop("children"),
  )

  if (externallyLoadedAccounts.size > 0) {
    const configuredOUPaths = getOUPaths(configuredOUs)

    const externalOUPathsNotConfigured = Array.from(
      externallyLoadedAccounts.keys(),
    ).filter((p) => !configuredOUPaths.includes(p))

    if (externalOUPathsNotConfigured.length > 0) {
      const details = externalOUPathsNotConfigured.map(
        (d) =>
          `Organizational unit '${d}' is not found from the configuration file but is referenced in externally configured accounts.`,
      )
      return err(
        new ValidationError(
          "Validation errors in organization configuration.",
          details,
        ),
      )
    }
  }

  const configuredAccountIds = getConfiguredAccountIds(configuredOUs)
  const nonUniqueConfiguredAccountIds = findNonUniques(configuredAccountIds)

  if (nonUniqueConfiguredAccountIds.length > 0) {
    const details = nonUniqueConfiguredAccountIds.map(
      (d) => `Account '${d}' is defined more than once in the configuration.`,
    )
    return err(
      new ValidationError(
        "Validation errors in organization configuration.",
        details,
      ),
    )
  }

  return ok({
    accountCreation,
    configSets,
    serviceControlPolicies,
    tagPolicies,
    aiServicesOptOutPolicies,
    backupPolicies,
    organizationalUnits,
    vars,
    stages,
    masterAccountId: `${record.masterAccountId}`,
    organizationAdminRoleName,
    accountAdminRoleName,
    accountBootstrapRoleName,
  })
}
