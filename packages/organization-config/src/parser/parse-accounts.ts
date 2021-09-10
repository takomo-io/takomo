import { IamRoleName, OrganizationPolicyName } from "@takomo/aws-model"
import { ConfigSetInstruction } from "@takomo/config-sets"
import { Vars } from "@takomo/core"
import { OrganizationAccountConfig } from "../model"
import { parseAccount } from "./parse-account"

interface ParseAccountsProps {
  readonly value: any
  readonly inheritedConfigSets: ReadonlyArray<ConfigSetInstruction>
  readonly inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetInstruction>
  readonly inheritedServiceControlPolicies: ReadonlyArray<OrganizationPolicyName>
  readonly inheritedTagPolicies: ReadonlyArray<OrganizationPolicyName>
  readonly inheritedAiServicesOptOutPolicies: ReadonlyArray<OrganizationPolicyName>
  readonly inheritedBackupPolicies: ReadonlyArray<OrganizationPolicyName>
  readonly inheritedVars: Vars
  readonly inheritedAccountAdminRoleName: IamRoleName
  readonly inheritedAccountBootstrapRoleName: IamRoleName
}

export const parseAccounts = ({
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
}: ParseAccountsProps): ReadonlyArray<OrganizationAccountConfig> => {
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
      inheritedVars,
      inheritedAccountAdminRoleName,
      inheritedAccountBootstrapRoleName,
    ),
  )
}
