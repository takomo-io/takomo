import { parseConfigSets } from "@takomo/config-sets"
import { CommandContext, parseVars } from "@takomo/core"
import { buildOrganizationConfigSchema } from "@takomo/organization-schema"
import { deepFreeze, TkmLogger, ValidationError } from "@takomo/util"
import { err, ok, Result } from "neverthrow"
import { OrganizationConfig } from "../model"
import { parseAccountCreationConfig } from "./parse-account-creation-config"
import { parseOrganizationalUnitsConfig } from "./parse-organizational-units-config"
import { parsePoliciesConfig } from "./parse-policies-config"
import { parseString } from "./parse-string"
import { parseTrustedAwsServices } from "./parse-trusted-aws-services"

export const buildOrganizationConfig = (
  logger: TkmLogger,
  ctx: CommandContext,
  record: Record<string, unknown>,
): Result<OrganizationConfig, ValidationError> => {
  const organizationConfigFileSchema = buildOrganizationConfigSchema({
    regions: ctx.regions,
    trustedAwsServices: ctx.organizationServicePrincipals,
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

  const accountCreation = parseAccountCreationConfig(record.accountCreation)
  const configSets = parseConfigSets(record.configSets)
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
  const organizationalUnits = parseOrganizationalUnitsConfig(
    logger,
    record.organizationalUnits,
  )

  const trustedAwsServices = parseTrustedAwsServices(record.trustedAwsServices)

  return ok(
    deepFreeze({
      accountCreation,
      configSets,
      serviceControlPolicies,
      tagPolicies,
      aiServicesOptOutPolicies,
      backupPolicies,
      organizationalUnits,
      vars,
      trustedAwsServices,
      masterAccountId: `${record.masterAccountId}`,
      organizationAdminRoleName: parseString(record.organizationAdminRoleName),
      accountAdminRoleName: parseString(record.accountAdminRoleName),
      accountBootstrapRoleName: parseString(
        record.accountBootstrapAdminRoleName,
      ),
    }),
  )
}