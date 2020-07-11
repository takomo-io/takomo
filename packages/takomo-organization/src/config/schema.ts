import Joi from "@hapi/joi"
import { configSetName, configSets } from "@takomo/config-sets"
import { accountId, Constants, vars } from "@takomo/core"

export const accountName = Joi.string().min(1).max(50)

export const accountEmail = Joi.string().email()

export const organizationRoleName = Joi.string()
  .min(1)
  .max(64)
  .regex(/^[\w+=/,.@-]+$/)

const newAccountDefaults = Joi.object({
  iamUserAccessToBilling: Joi.boolean(),
  roleName: organizationRoleName,
})

const newAccountConstraints = Joi.object({
  namePattern: Joi.string(),
  emailPattern: Joi.string(),
})

export const accountCreation = Joi.object({
  defaults: newAccountDefaults,
  constraints: newAccountConstraints,
})

const organizationAccountStatus = Joi.string().valid(
  "active",
  "disabled",
  "suspended",
)

const policyName = Joi.string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9_-]+$/)
  .required()

const policy = Joi.object({
  description: Joi.string().min(1).max(512).required(),
  awsManaged: Joi.boolean(),
})

const organizationAccount = Joi.object({
  id: accountId.required(),
  name: Joi.string(),
  email: Joi.string().email(),
  accountAdminRoleName: organizationRoleName,
  configSets: [Joi.array().items(configSetName).unique(), configSetName],
  bootstrapConfigSets: [
    Joi.array().items(configSetName).unique(),
    configSetName,
  ],
  serviceControlPolicies: [policyName, Joi.array().items(policyName).unique()],
  tagPolicies: [policyName, Joi.array().items(policyName).unique()],
  backupPolicies: [policyName, Joi.array().items(policyName).unique()],
  aiServicesOptOutPolicies: [
    policyName,
    Joi.array().items(policyName).unique(),
  ],
  status: organizationAccountStatus,
  description: Joi.string(),
  vars,
})

export const organizationalUnitName = Joi.string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9-_ ]+$/)
  .custom((value, helpers) => {
    const stringValue = `${value}`
    if (stringValue.startsWith(" ")) {
      return helpers.error("startsWithWhitespace")
    }
    if (stringValue.endsWith(" ")) {
      return helpers.error("endsWithWhitespace")
    }
    if (stringValue.includes("  ")) {
      return helpers.error("subsequentWhitespace")
    }
    return value
  })
  .messages({
    startsWithWhitespace: "{{#label}} must not start with whitespace",
    endsWithWhitespace: "{{#label}} must not end with whitespace",
    subsequentWhitespace: "{{#label}} must not contain subsequent whitespace",
  })

export const organizationalUnitPath = Joi.string()
  .min(1)
  .max(129 * 5 - 1)
  .custom((value, helpers) => {
    const regex = /^Root(\/[a-zA-Z0-9-_/ ]+)?$/
    if (!regex.test(value)) {
      return helpers.error("string.pattern.base", { regex })
    }

    if (value.endsWith(" ")) {
      return helpers.error("endsWithWhitespace")
    }
    if (value.includes("  ")) {
      return helpers.error("subsequentWhitespace")
    }
    if (value.includes("//")) {
      return helpers.error("subsequentSeparators")
    }
    if (value.endsWith("/")) {
      return helpers.error("endsWithSeparator")
    }

    const parts = value.split("/")
    if (parts.length > 5) {
      return helpers.error("maxDepth")
    }

    return value
  })
  .messages({
    maxDepth: "{{#label}} hierarchy depth must not exceed 5",
    endsWithWhitespace: "{{#label}} must not end with whitespace",
    endsWithSeparator: "{{#label}} must not end with path separator (/)",
    subsequentSeparators:
      "{{#label}} must not contain subsequent path separators (/)",
    subsequentWhitespace: "{{#label}} must not contain subsequent whitespace",
  })

const organizationalUnit = Joi.object({
  vars,
  accountAdminRoleName: organizationRoleName,
  status: Joi.string().valid("active", "disabled"),
  priority: Joi.number().integer().min(0),
  configSets: [Joi.array().items(configSetName).unique(), configSetName],
  bootstrapConfigSets: [
    Joi.array().items(configSetName).unique(),
    configSetName,
  ],
  accounts: Joi.array().items(organizationAccount, accountId),
  serviceControlPolicies: [policyName, Joi.array().items(policyName).unique()],
  tagPolicies: [policyName, Joi.array().items(policyName).unique()],
  backupPolicies: [policyName, Joi.array().items(policyName).unique()],
  aiServicesOptOutPolicies: [
    policyName,
    Joi.array().items(policyName).unique(),
  ],
})

export const policies = Joi.object().pattern(policyName, policy)

export const organizationalUnits = Joi.object().pattern(
  organizationalUnitPath,
  organizationalUnit,
)

export const trustedAwsService = Joi.string().valid(
  ...Constants.ORGANIZATION_SERVICE_PRINCIPALS,
)

export const trustedAwsServices = Joi.array().items(trustedAwsService).unique()

export const organizationConfigFileSchema = Joi.object({
  vars,
  accountCreation,
  serviceControlPolicies: [policies, Joi.boolean()],
  tagPolicies: [policies, Joi.boolean()],
  aiServicesOptOutPolicies: [policies, Joi.boolean()],
  backupPolicies: [policies, Joi.boolean()],
  organizationalUnits: organizationalUnits.required(),
  configSets,
  trustedAwsServices,
  organizationAdminRoleName: organizationRoleName,
  accountAdminRoleName: organizationRoleName,
  accountBootstrapRoleName: organizationRoleName,
  masterAccountId: accountId.required(),
})
