import { OrganizationPolicyName } from "@takomo/aws-model"
import { ConfigSetName } from "@takomo/config-sets"
import { OrganizationAccountConfig } from "../model"
import { parseAccount } from "./parse-account"

export const parseAccounts = (
  value: any,
  inheritedConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedServiceControlPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedTagPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedAiServicesOptOutPolicies: ReadonlyArray<OrganizationPolicyName>,
  inheritedBackupPolicies: ReadonlyArray<OrganizationPolicyName>,
): OrganizationAccountConfig[] => {
  if (value === null || value === undefined) {
    return []
  }

  return value.map((account: any) =>
    parseAccount(
      account,
      inheritedConfigSets.slice(),
      inheritedBootstrapConfigSets.slice(),
      inheritedServiceControlPolicies.slice(),
      inheritedTagPolicies.slice(),
      inheritedAiServicesOptOutPolicies.slice(),
      inheritedBackupPolicies.slice(),
    ),
  )
}
