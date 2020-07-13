import { ConfigSetName } from "@takomo/config-sets"
import { parseVars } from "@takomo/core"
import { PolicyName } from "aws-sdk/clients/organizations"
import uniq from "lodash.uniq"
import { OrganizationAccount, OrganizationAccountStatus } from "../model"
import { parseAccountStatus } from "./parse-account-status"
import { parseConfigSetNames } from "./parse-config-set-names"
import { parsePolicyNames } from "./parse-policy-names"

const parseSimpleAccount = (
  id: string,
  inheritedConfigSets: ConfigSetName[],
  inheritedBootstrapConfigSets: ConfigSetName[],
  inheritedServiceControlPolicies: PolicyName[],
  inheritedTagPolicies: PolicyName[],
  inheritedAiServicesOptOutPolicies: PolicyName[],
  inheritedBackupPolicies: PolicyName[],
): OrganizationAccount => {
  return {
    id,
    configSets: inheritedConfigSets,
    bootstrapConfigSets: inheritedBootstrapConfigSets,
    name: null,
    email: null,
    description: null,
    vars: {},
    accountAdminRoleName: null,
    accountBootstrapRoleName: null,
    status: OrganizationAccountStatus.ACTIVE,
    policies: {
      serviceControl: {
        inherited: inheritedServiceControlPolicies,
        // Each account must have at least one service control policy attached at all times.
        // Therefore we attach the first inherited policy if the account doesn't have a policy
        // attached directly.
        attached: inheritedServiceControlPolicies.slice(0, 1),
      },
      tag: {
        inherited: inheritedTagPolicies,
        attached: [],
      },
      backup: {
        inherited: inheritedBackupPolicies,
        attached: [],
      },
      aiServicesOptOut: {
        inherited: inheritedAiServicesOptOutPolicies,
        attached: [],
      },
    },
  }
}

const parseComplexAccount = (
  value: any,
  inheritedConfigSets: ConfigSetName[],
  inheritedBootstrapConfigSets: ConfigSetName[],
  inheritedServiceControlPolicies: PolicyName[],
  inheritedTagPolicies: PolicyName[],
  inheritedAiServicesOptOutPolicies: PolicyName[],
  inheritedBackupPolicies: PolicyName[],
): OrganizationAccount => {
  const configuredConfigSets = parseConfigSetNames(value.configSets)
  const configSets = uniq([...inheritedConfigSets, ...configuredConfigSets])

  const configuredBootstrapConfigSets = parseConfigSetNames(
    value.bootstrapConfigSets,
  )
  const bootstrapConfigSets = uniq([
    ...configuredBootstrapConfigSets,
    ...inheritedBootstrapConfigSets,
  ])

  const serviceControlPolicies = parsePolicyNames(value.serviceControlPolicies)

  const tagPolicies = parsePolicyNames(value.tagPolicies)

  const aiServicesOptOutPolicies = parsePolicyNames(
    value.aiServicesOptOutPolicies,
  )

  const backupPolicies = parsePolicyNames(value.backupPolicies)

  const policies = {
    serviceControl: {
      inherited: inheritedServiceControlPolicies,
      // Each account must have at least one service control policy attached at all times.
      // Therefore we attach the first inherited policy if the account doesn't have a policy
      // attached directly.
      attached:
        serviceControlPolicies.length > 0
          ? serviceControlPolicies
          : inheritedServiceControlPolicies.slice(0, 1),
    },
    tag: {
      inherited: inheritedTagPolicies,
      attached: tagPolicies,
    },
    backup: {
      inherited: inheritedBackupPolicies,
      attached: backupPolicies,
    },
    aiServicesOptOut: {
      inherited: inheritedAiServicesOptOutPolicies,
      attached: aiServicesOptOutPolicies,
    },
  }

  return {
    configSets,
    bootstrapConfigSets,
    policies,
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

export const parseAccount = (
  value: any,
  inheritedConfigSets: ConfigSetName[],
  inheritedBootstrapConfigSets: ConfigSetName[],
  inheritedServiceControlPolicies: PolicyName[],
  inheritedTagPolicies: PolicyName[],
  inheritedAiServicesOptOutPolicies: PolicyName[],
  inheritedBackupPolicies: PolicyName[],
): OrganizationAccount => {
  if (typeof value === "string") {
    return parseSimpleAccount(
      value,
      inheritedConfigSets,
      inheritedBootstrapConfigSets,
      inheritedServiceControlPolicies,
      inheritedTagPolicies,
      inheritedAiServicesOptOutPolicies,
      inheritedBackupPolicies,
    )
  }

  return parseComplexAccount(
    value,
    inheritedConfigSets,
    inheritedBootstrapConfigSets,
    inheritedServiceControlPolicies,
    inheritedTagPolicies,
    inheritedAiServicesOptOutPolicies,
    inheritedBackupPolicies,
  )
}
