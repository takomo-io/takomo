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
    }
  }

  const configuredConfigSets = value.configSets || []
  const configSets = uniq([...inheritedConfigSets, ...configuredConfigSets])

  const configuredBootstrapConfigSets = value.bootstrapConfigSets || []
  const bootstrapConfigSets = uniq([
    ...inheritedBootstrapConfigSets,
    ...configuredBootstrapConfigSets,
  ])

  const configuredServiceControlPolicies = value.serviceControlPolicies || []
  const serviceControlPolicies = uniq([
    ...inheritedServiceControlPolicies,
    ...configuredServiceControlPolicies,
  ])

  const configuredTagPolicies = value.tagPolicies || []
  const tagPolicies = uniq([...inheritedTagPolicies, ...configuredTagPolicies])

  return {
    configSets,
    bootstrapConfigSets,
    tagPolicies,
    serviceControlPolicies,
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

const parsePolicyNames = (value: any): string[] => {
  if (value === null || value === undefined) {
    return []
  }

  if (typeof value === "string") {
    return [value]
  }

  return value
}

const parseConfigSetNames = (value: any): string[] => {
  if (value === null || value === undefined) {
    return []
  }

  if (typeof value === "string") {
    return [value]
  }

  return value
}

const parseOrganizationalUnit = (
  ouPath: string,
  config: any,
  inheritedServiceControlPolicies: string[],
  inheritedTagPolicies: string[],
  inheritedConfigSets: ConfigSetName[],
  inheritedBootstrapConfigSets: ConfigSetName[],
): OrganizationalUnit => {
  const ou = config[ouPath]
  const ouPathDepth = ouPath.split("/").length

  const childPaths = Object.keys(config).filter((key) =>
    key.startsWith(`${ouPath}/`),
  )

  const directChildPaths = childPaths.filter(
    (key) => key.split("/").length === ouPathDepth + 1,
  )

  const missingDirectChildPaths = uniq(
    childPaths
      .filter((key) => key.split("/").length >= ouPathDepth + 2)
      .map((key) =>
        key
          .split("/")
          .slice(0, ouPathDepth + 1)
          .join("/"),
      ),
  )

  const configuredServiceControlPolicies = parsePolicyNames(
    ou?.serviceControlPolicies,
  )
  const configuredTagPolicies = parsePolicyNames(ou?.tagPolicies)
  const serviceControlPolicies = uniq([
    ...inheritedServiceControlPolicies,
    ...configuredServiceControlPolicies,
  ])
  const tagPolicies = uniq([...inheritedTagPolicies, ...configuredTagPolicies])

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
      childPath,
      config,
      serviceControlPolicies,
      tagPolicies,
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
  )
  const name = ouPath.split("/").reverse()[0]

  return {
    name,
    children,
    accounts,
    serviceControlPolicies,
    tagPolicies,
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
  value: any,
): OrganizationalUnitsConfig => ({
  Root: parseOrganizationalUnit("Root", value, [], [], [], []),
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

  const parsedFile = (await parseYaml(rendered)) || {}

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
  const vars = parseVars(parsedFile.vars)
  const organizationalUnits = parseOrganizationalUnitsConfig(
    parsedFile.organizationalUnits,
  )

  return {
    accountCreation,
    configSets,
    serviceControlPolicies,
    tagPolicies,
    organizationalUnits,
    vars,
    trustedAwsServices: parsedFile.trustedAwsServices || null,
    organizationAdminRoleName: parsedFile.organizationAdminRoleName || null,
    accountAdminRoleName: parsedFile.accountAdminRoleName || null,
    accountBootstrapRoleName: parsedFile.accountBootstrapAdminRoleName || null,
    masterAccountId: `${parsedFile.masterAccountId}`,
  }
}
