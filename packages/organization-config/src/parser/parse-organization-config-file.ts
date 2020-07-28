import { parseConfigSets } from "@takomo/config-sets"
import { Constants, Options, parseVars } from "@takomo/core"
import {
  Logger,
  parseYaml,
  readFileContents,
  renderTemplate,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import { OrganizationConfigFile } from "../model"
import { organizationConfigFileSchema } from "../schema"
import { parseAccountCreationConfig } from "./parse-account-creation-config"
import { parseOrganizationalUnitsConfig } from "./parse-organizational-units-config"
import { parsePoliciesConfig } from "./parse-policies-config"

export const parseOrganizationConfigFile = async (
  logger: Logger,
  options: Options,
  variables: any,
  path: string,
  templateEngine: TemplateEngine,
): Promise<OrganizationConfigFile> => {
  const logConfidentialInfo = options.isConfidentialInfoLoggingEnabled()
  const contents = await readFileContents(path)

  const filterFn = logConfidentialInfo
    ? (obj: any) => obj
    : (obj: any) => {
        return {
          ...obj,
          env: "<concealed>",
        }
      }

  logger.traceText(`Raw organization config file:`, contents)
  logger.traceObject(
    `Render organization config file using variables:`,
    variables,
    filterFn,
  )

  const rendered = await renderTemplate(
    templateEngine,
    path,
    contents,
    variables,
  )

  logger.traceText(`Final rendered organization config file:`, rendered)

  const parsedFile = (await parseYaml(path, rendered)) || {}

  const { error } = organizationConfigFileSchema.validate(parsedFile, {
    abortEarly: false,
  })

  if (error) {
    const details = error.details.map((d) => `  - ${d.message}`).join("\n")
    throw new TakomoError(
      `${error.details.length} validation error(s) in organization config file ${path}:\n\n${details}`,
    )
  }

  const accountCreation = parseAccountCreationConfig(parsedFile.accountCreation)
  const configSets = parseConfigSets(parsedFile.configSets)
  const serviceControlPolicies = parsePoliciesConfig(
    Constants.SERVICE_CONTROL_POLICY_TYPE,
    parsedFile.serviceControlPolicies,
  )
  const tagPolicies = parsePoliciesConfig(
    Constants.TAG_POLICY_TYPE,
    parsedFile.tagPolicies,
  )
  const aiServicesOptOutPolicies = parsePoliciesConfig(
    Constants.AISERVICES_OPT_OUT_POLICY_TYPE,
    parsedFile.aiServicesOptOutPolicies,
  )
  const backupPolicies = parsePoliciesConfig(
    Constants.BACKUP_POLICY_TYPE,
    parsedFile.backupPolicies,
  )
  const vars = parseVars(parsedFile.vars)
  const organizationalUnits = parseOrganizationalUnitsConfig(
    logger,
    parsedFile.organizationalUnits,
  )

  return {
    accountCreation,
    configSets,
    serviceControlPolicies,
    tagPolicies,
    aiServicesOptOutPolicies,
    backupPolicies,
    organizationalUnits,
    vars,
    trustedAwsServices: parsedFile.trustedAwsServices || null,
    organizationAdminRoleName: parsedFile.organizationAdminRoleName || null,
    accountAdminRoleName: parsedFile.accountAdminRoleName || null,
    accountBootstrapRoleName: parsedFile.accountBootstrapAdminRoleName || null,
    masterAccountId: `${parsedFile.masterAccountId}`,
  }
}
