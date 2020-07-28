import Joi from "@hapi/joi"
import { configSets } from "@takomo/config-sets"
import { accountId, vars } from "@takomo/core"
import {
  accountCreation,
  organizationalUnits,
  organizationRoleName,
  policies,
  trustedAwsServices,
} from "@takomo/organization-schema"

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
