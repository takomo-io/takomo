import { ConfigSetName, parseConfigSets } from "@takomo/config-sets"
import { Constants, Options, parseRegex, parseVars } from "@takomo/core"
import {
  Logger,
  parseYaml,
  readFileContents,
  renderTemplate,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import { PolicyName, PolicyType } from "aws-sdk/clients/organizations"
import uniq from "lodash.uniq"
import {
  AccountCreationConfig,
  OrganizationAccount,
  OrganizationAccountStatus,
  OrganizationalUnit,
  OrganizationalUnitsConfig,
  OrganizationalUnitStatus,
  OrganizationConfigFile,
  PoliciesConfig,
  PolicyConfig,
} from "../model"
import { organizationConfigFileSchema } from "./schema"

const parsePolicyNames = (value: any): PolicyName[] => {
  if (value === null || value === undefined) {
    return []
  }

  if (typeof value === "string") {
    return [value]
  }

  return value
}

const parseConfigSetNames = (value: any): ConfigSetName[] => {
  if (value === null || value === undefined) {
    return []
  }

  if (typeof value === "string") {
    return [value]
  }

  return value
}

const parseAccountCreationConfig = (value: any): AccountCreationConfig => {
  if (value === null || value === undefined) {
    return {
      defaults: {
        roleName: Constants.DEFAULT_ORGANIZATION_ROLE_NAME,
        iamUserAccessToBilling: true,
      },
      constraints: {
        emailPattern: null,
        namePattern: null,
      },
    }
  }

  const emailPattern = parseRegex(
    "accountCreation.constraints.emailPattern",
    value.emailPattern,
  )
  const namePattern = parseRegex(
    "accountCreation.constraints.namePattern",
    value.namePattern,
  )

  return {
    defaults: {
      roleName:
        value.accountAdminRoleName || Constants.DEFAULT_ORGANIZATION_ROLE_NAME,
      iamUserAccessToBilling: value.iamUserAccessToBilling !== false,
    },
    constraints: {
      emailPattern,
      namePattern,
    },
  }
}

const parseAccountStatus = (value: any): OrganizationAccountStatus => {
  switch (value) {
    case "active":
      return OrganizationAccountStatus.ACTIVE
    case "disabled":
      return OrganizationAccountStatus.DISABLED
    case "suspended":
      return OrganizationAccountStatus.SUSPENDED
    default:
      return OrganizationAccountStatus.ACTIVE
  }
}

const parseOrganizationalUnitStatus = (
  value: any,
): OrganizationalUnitStatus => {
  switch (value) {
    case "active":
      return OrganizationalUnitStatus.ACTIVE
    case "disabled":
      return OrganizationalUnitStatus.DISABLED
    default:
      return OrganizationalUnitStatus.ACTIVE
  }
}

const parseAccount = (
  value: any,
  inheritedConfigSets: ConfigSetName[],
  inheritedBootstrapConfigSets: ConfigSetName[],
  inheritedServiceControlPolicies: PolicyName[],
  inheritedTagPolicies: PolicyName[],
  inheritedAiServicesOptOutPolicies: PolicyName[],
  inheritedBackupPolicies: PolicyName[],
): OrganizationAccount => {
  if (typeof value === "string") {
    return {
      configSets: inheritedConfigSets,
      bootstrapConfigSets: inheritedBootstrapConfigSets,
      id: `${value}`,
      name: null,
      email: null,
      description: null,
      vars: {},
      accountAdminRoleName: null,
      accountBootstrapRoleName: null,
      status: OrganizationAccountStatus.ACTIVE,
      tagPolicies: inheritedTagPolicies,
      serviceControlPolicies: inheritedServiceControlPolicies,
      aiServicesOptOutPolicies: inheritedAiServicesOptOutPolicies,
      backupPolicies: inheritedBackupPolicies,
    }
  }

  const configuredConfigSets = parseConfigSetNames(value.configSets)
  const configSets = uniq([...inheritedConfigSets, ...configuredConfigSets])

  const configuredBootstrapConfigSets = parseConfigSetNames(
    value.bootstrapConfigSets,
  )
  const bootstrapConfigSets = uniq([
    ...inheritedBootstrapConfigSets,
    ...configuredBootstrapConfigSets,
  ])

  const configuredServiceControlPolicies = parsePolicyNames(
    value.serviceControlPolicies,
  )
  const serviceControlPolicies = uniq([
    ...inheritedServiceControlPolicies,
    ...configuredServiceControlPolicies,
  ])

  const configuredTagPolicies = parsePolicyNames(value.tagPolicies)
  const tagPolicies = uniq([...inheritedTagPolicies, ...configuredTagPolicies])

  const configuredAiServicesOptOutPolicies = parsePolicyNames(
    value.aiServicesOptOutPolicies,
  )
  const aiServicesOptOutPolicies = uniq([
    ...inheritedAiServicesOptOutPolicies,
    ...configuredAiServicesOptOutPolicies,
  ])

  const configuredBackupPolicies = parsePolicyNames(value.backupPolicies)
  const backupPolicies = uniq([
    ...inheritedBackupPolicies,
    ...configuredBackupPolicies,
  ])

  return {
    configSets,
    bootstrapConfigSets,
    tagPolicies,
    serviceControlPolicies,
    aiServicesOptOutPolicies,
    backupPolicies,
    id: `${value.id}`,
    name: value.name || null,
    email: value.email || null,
    description: value.description || null,
    vars: parseVars(value.vars),
    accountAdminRoleName: value.accountAdminRoleName || null,
    accountBootstrapRoleName: value.accountBootstrapRoleName || null,
    status: parseAccountStatus(value.status),
  }
}

const parseAccounts = (
  value: any,
  inheritedConfigSets: ConfigSetName[],
  inheritedBootstrapConfigSets: ConfigSetName[],
  inheritedServiceControlPolicies: PolicyName[],
  inheritedTagPolicies: PolicyName[],
  inheritedAiServicesOptOutPolicies: PolicyName[],
  inheritedBackupPolicies: PolicyName[],
): OrganizationAccount[] => {
  if (value === null || value === undefined) {
    return []
  }

  return value.map((account: any) =>
    parseAccount(
      account,
      inheritedConfigSets,
      inheritedBootstrapConfigSets,
      inheritedServiceControlPolicies,
      inheritedTagPolicies,
      inheritedAiServicesOptOutPolicies,
      inheritedBackupPolicies,
    ),
  )
}

const parsePolicies = (value: any): PolicyConfig[] => {
  if (!value) {
    return []
  }
  return Object.keys(value).map((policyName) => ({
    name: policyName,
    description: value[policyName].description,
    awsManaged: value[policyName].awsManaged === true,
  }))
}

const parsePoliciesConfig = (
  policyType: PolicyType,
  value: any,
): PoliciesConfig => {
  if (value === null || value === undefined) {
    return {
      policyType,
      enabled: false,
      policies: [],
    }
  }

  if (typeof value === "boolean") {
    return {
      policyType,
      enabled: value,
      policies: [],
    }
  }

  return {
    policyType,
    enabled: true,
    policies: parsePolicies(value),
  }
}

export const findMissingDirectChildrenPaths = (
  childPaths: string[],
  ouPathDepth: number,
): string[] => {
  return uniq(
    childPaths
      .filter((key) => key.split("/").length >= ouPathDepth + 2)
      .map((key) =>
        key
          .split("/")
          .slice(0, ouPathDepth + 1)
          .join("/"),
      )
      .filter((key) => !childPaths.includes(key)),
  )
}

const parseOrganizationalUnit = (
  parentLogger: Logger,
  ouPath: string,
  config: any,
  inheritedServiceControlPolicies: PolicyName[],
  inheritedTagPolicies: PolicyName[],
  inheritedAiServicesOptOutPolicies: PolicyName[],
  inheritedBackupPolicies: PolicyName[],
  inheritedConfigSets: ConfigSetName[],
  inheritedBootstrapConfigSets: ConfigSetName[],
): OrganizationalUnit => {
  const name = ouPath.split("/").reverse()[0]
  const ouPathDepth = ouPath.split("/").length

  const logger = parentLogger.childLogger(name)

  logger.debugObject("Parsing ou:", { path: ouPath, name, depth: ouPathDepth })

  const childPaths = Object.keys(config).filter((key) =>
    key.startsWith(`${ouPath}/`),
  )

  logger.debugObject("Child paths:", childPaths)

  const directChildPaths = childPaths.filter(
    (key) => key.split("/").length === ouPathDepth + 1,
  )

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
    ...inheritedServiceControlPolicies,
    ...configuredServiceControlPolicies,
  ])
  const tagPolicies = uniq([...inheritedTagPolicies, ...configuredTagPolicies])
  const aiServicesOptOutPolicies = uniq([
    ...inheritedAiServicesOptOutPolicies,
    ...configuredAiServicesOptOutPolicies,
  ])

  const backupPolicies = uniq([
    ...inheritedBackupPolicies,
    ...configuredBackupPolicies,
  ])

  const configuredConfigSets = parseConfigSetNames(ou?.configSets)
  const configSets = uniq([...inheritedConfigSets, ...configuredConfigSets])

  const configuredBootstrapConfigSets = parseConfigSetNames(
    ou?.bootstrapConfigSets,
  )
  const bootstrapConfigSets = uniq([
    ...inheritedBootstrapConfigSets,
    ...configuredBootstrapConfigSets,
  ])

  const children = [
    ...missingDirectChildPaths,
    ...directChildPaths,
  ].map((childPath) =>
    parseOrganizationalUnit(
      logger,
      childPath,
      config,
      serviceControlPolicies,
      tagPolicies,
      aiServicesOptOutPolicies,
      backupPolicies,
      configSets,
      bootstrapConfigSets,
    ),
  )

  const accounts = parseAccounts(
    ou?.accounts,
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
    serviceControlPolicies,
    tagPolicies,
    aiServicesOptOutPolicies,
    backupPolicies,
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

const parseOrganizationalUnitsConfig = (
  logger: Logger,
  value: any,
): OrganizationalUnitsConfig => ({
  Root: parseOrganizationalUnit(logger, "Root", value, [], [], [], [], [], []),
})

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
