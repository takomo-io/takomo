import { ConfigSetName } from "@takomo/config-sets"
import { PolicyName } from "aws-sdk/clients/organizations"
import { OrganizationAccount } from "../model"
import { parseAccount } from "./parse-account"

export const parseAccounts = (
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
      inheritedConfigSets.slice(),
      inheritedBootstrapConfigSets.slice(),
      inheritedServiceControlPolicies.slice(),
      inheritedTagPolicies.slice(),
      inheritedAiServicesOptOutPolicies.slice(),
      inheritedBackupPolicies.slice(),
    ),
  )
}
