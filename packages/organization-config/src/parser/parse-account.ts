import { OrganizationPolicyName } from "@takomo/aws-model"
import { ConfigSetName } from "@takomo/config-sets"
import { parseVars } from "@takomo/core"
import R from "ramda"
import { OrganizationAccountConfig } from "../model"
import { parseAccountStatus } from "./parse-account-status"
import { parseConfigSetNames } from "./parse-config-set-names"
import { parsePolicyNames } from "./parse-policy-names"

const parseSimpleAccount = (
  id: string,
  inheritedConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedServiceControlPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedTagPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedAiServicesOptOutPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedBackupPolicies: ReadonlyArray<OrganizationPolicyName>,
): OrganizationAccountConfig => {
  return {
    id,
    configSets: inheritedConfigSets,
    bootstrapConfigSets: inheritedBootstrapConfigSets,
    vars: {},
    status: "active",
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
  inheritedConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedServiceControlPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedTagPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedAiServicesOptOutPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedBackupPolicies: ReadonlyArray<OrganizationPolicyName>,
): OrganizationAccountConfig => {
  const configuredConfigSets = parseConfigSetNames(value.configSets)
  const configSets = R.uniq([...inheritedConfigSets, ...configuredConfigSets])

  const configuredBootstrapConfigSets = parseConfigSetNames(
    value.bootstrapConfigSets,
  )
  const bootstrapConfigSets = R.uniq([
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
  inheritedConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedServiceControlPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedTagPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedAiServicesOptOutPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedBackupPolicies: ReadonlyArray<OrganizationPolicyName>,
): OrganizationAccountConfig => {
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
