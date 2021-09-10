import { IamRoleName, OrganizationPolicyName } from "@takomo/aws-model"
import { ConfigSetInstruction } from "@takomo/config-sets"
import { parseStringArray, parseVars, Vars } from "@takomo/core"
import { deepCopy, merge } from "@takomo/util"
import { OrganizationAccountConfig } from "../model"
import { mergeConfigSetInstructions } from "./merge-config-set-instructions"
import { parseAccountStatus } from "./parse-account-status"
import { parseConfigSetInstructions } from "./parse-config-set-instructions"

const parseSimpleAccount = (
  id: string,
  inheritedConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedServiceControlPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedTagPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedAiServicesOptOutPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedBackupPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedVars: Vars,
  inheritedAccountAdminRoleName: IamRoleName,
  inheritedAccountBootstrapRoleName: IamRoleName,
): OrganizationAccountConfig => {
  return {
    id,
    configSets: inheritedConfigSets,
    bootstrapConfigSets: inheritedBootstrapConfigSets,
    vars: deepCopy(inheritedVars),
    status: "active",
    accountAdminRoleName: inheritedAccountAdminRoleName,
    accountBootstrapRoleName: inheritedAccountBootstrapRoleName,
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
  inheritedConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedServiceControlPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedTagPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedAiServicesOptOutPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedBackupPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedVars: Vars,
  inheritedAccountAdminRoleName: IamRoleName,
  inheritedAccountBootstrapRoleName: IamRoleName,
): OrganizationAccountConfig => {
  const configuredConfigSets = parseConfigSetInstructions(value.configSets)
  const configSets = mergeConfigSetInstructions(
    inheritedConfigSets,
    configuredConfigSets,
  )

  const configuredBootstrapConfigSets = parseConfigSetInstructions(
    value.bootstrapConfigSets,
  )
  const bootstrapConfigSets = mergeConfigSetInstructions(
    configuredBootstrapConfigSets,
    inheritedBootstrapConfigSets,
  )

  const serviceControlPolicies = parseStringArray(value.serviceControlPolicies)

  const tagPolicies = parseStringArray(value.tagPolicies)

  const aiServicesOptOutPolicies = parseStringArray(
    value.aiServicesOptOutPolicies,
  )

  const backupPolicies = parseStringArray(value.backupPolicies)

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

  const vars = merge(inheritedVars, parseVars(value.vars))

  return {
    configSets,
    bootstrapConfigSets,
    policies,
    id: `${value.id}`,
    name: value.name ?? null,
    email: value.email ?? null,
    description: value.description ?? null,
    vars,
    accountAdminRoleName:
      value.accountAdminRoleName ?? inheritedAccountAdminRoleName,
    accountBootstrapRoleName:
      value.accountBootstrapRoleName ?? inheritedAccountBootstrapRoleName,
    status: parseAccountStatus(value.status),
  }
}

export const parseAccount = (
  value: any,
  inheritedConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedServiceControlPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedTagPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedAiServicesOptOutPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedBackupPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedVars: Vars,
  inheritedAccountAdminRoleName: IamRoleName,
  inheritedAccountBootstrapRoleName: IamRoleName,
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
      inheritedVars,
      inheritedAccountAdminRoleName,
      inheritedAccountBootstrapRoleName,
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
    inheritedVars,
    inheritedAccountAdminRoleName,
    inheritedAccountBootstrapRoleName,
  )
}
