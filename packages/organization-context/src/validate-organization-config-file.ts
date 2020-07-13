import { ConfigSet } from "@takomo/config-sets"
import { CallerIdentity } from "@takomo/core"
import {
  OrganizationAccountStatus,
  OrganizationalUnit,
  OrganizationConfigFile,
  OrganizationPolicyConfig,
} from "@takomo/organization-config"
import { collectFromHierarchy, TakomoError } from "@takomo/util"
import { Account, Organization } from "aws-sdk/clients/organizations"
import flatten from "lodash.flatten"
import {
  AccountsMissingFromLocalConfigError,
  NonExistingAccountsInLocalConfigError,
  SuspendedAccountsInLocalConfigError,
} from "./error"
import { OrganizationContext } from "./organization-context"

const collectPolicyNames = (
  policies: OrganizationPolicyConfig[] | undefined,
): string[] => (policies ? policies.map((p) => p.name) : [])

const collectConfigSetNames = (configSets: ConfigSet[]): string[] =>
  configSets.map((r) => r.name)

export const validateOrganizationConfigFile = (
  configFile: OrganizationConfigFile,
  masterCallerIdentity: CallerIdentity,
  organization: Organization,
): void => {
  const {
    serviceControlPolicies,
    tagPolicies,
    aiServicesOptOutPolicies,
    backupPolicies,
    configSets,
    organizationalUnits: { Root },
  } = configFile

  if (configFile.masterAccountId !== masterCallerIdentity.accountId) {
    throw new TakomoError(
      `Current credentials refer to an account ${masterCallerIdentity.accountId} which does not match with the master account id ${configFile.masterAccountId} defined in the organization configuration file`,
    )
  }

  if (organization.FeatureSet !== "ALL") {
    if (configFile.serviceControlPolicies.enabled) {
      throw new TakomoError(
        "Local configuration must not contain 'serviceControlPolicies' configuration when the organization does not have all features enabled",
      )
    }

    if (configFile.tagPolicies.enabled) {
      throw new TakomoError(
        "Local configuration must not contain 'tagPolicies' configuration when the organization does not have all features enabled",
      )
    }

    if (configFile.aiServicesOptOutPolicies.enabled) {
      throw new TakomoError(
        "Local configuration must not contain 'aiServicesOptOutPolicies' configuration when the organization does not have all features enabled",
      )
    }

    if (configFile.backupPolicies.enabled) {
      throw new TakomoError(
        "Local configuration must not contain 'backupPolicies' configuration when the organization does not have all features enabled",
      )
    }

    if (configFile.trustedAwsServices) {
      throw new TakomoError(
        "Local configuration must not contain 'trustedAwsServices' configuration when the organization does not have all features enabled",
      )
    }
  }

  if (organization.FeatureSet === "ALL" && serviceControlPolicies.enabled) {
    if (serviceControlPolicies.policies.length === 0) {
      throw new TakomoError(
        "Local configuration must contain at least one service control policy when the organization has service control policies enabled",
        {
          instructions: [
            "Add at least one service control policy to 'policies.serviceControlPolicy'",
          ],
        },
      )
    }

    if (Root.policies.serviceControl.attached.length === 0) {
      throw new TakomoError(
        "Root organizational unit must have at least one service control policy attached when the organization has service control policies enabled",
      )
    }
  }

  const serviceControlPolicyNames = collectPolicyNames(
    serviceControlPolicies.policies,
  )
  const tagPolicyNames = collectPolicyNames(tagPolicies.policies)
  const aiServicesOptOutPolicyNames = collectPolicyNames(
    aiServicesOptOutPolicies.policies,
  )
  const backupPolicyNames = collectPolicyNames(backupPolicies.policies)
  const configSetNames = collectConfigSetNames(configSets)

  const validateOu = (ou: OrganizationalUnit): void => {
    ou.policies.serviceControl.attached.forEach((policyName) => {
      if (!serviceControlPolicyNames.includes(policyName)) {
        throw new TakomoError(
          `Organizational unit '${ou.path}' refers to a non-existing service control policy '${policyName}'`,
        )
      }
    })

    ou.policies.tag.attached.forEach((policyName) => {
      if (!tagPolicyNames.includes(policyName)) {
        throw new TakomoError(
          `Organizational unit '${ou.path}' refers to a non-existing tag policy '${policyName}'`,
        )
      }
    })

    ou.policies.aiServicesOptOut.attached.forEach((policyName) => {
      if (!aiServicesOptOutPolicyNames.includes(policyName)) {
        throw new TakomoError(
          `Organizational unit '${ou.path}' refers to a non-existing AI services opt-out policy '${policyName}'`,
        )
      }
    })

    ou.policies.backup.attached.forEach((policyName) => {
      if (!backupPolicyNames.includes(policyName)) {
        throw new TakomoError(
          `Organizational unit '${ou.path}' refers to a non-existing backup policy '${policyName}'`,
        )
      }
    })

    ou.configSets.forEach((configSetName) => {
      if (!configSetNames.includes(configSetName)) {
        throw new TakomoError(
          `Organizational unit '${ou.path}' refers to a non-existing config set '${configSetName}'`,
        )
      }
    })

    ou.bootstrapConfigSets.forEach((configSetName) => {
      if (!configSetNames.includes(configSetName)) {
        throw new TakomoError(
          `Organizational unit '${ou.path}' refers to a non-existing bootstrap config set '${configSetName}'`,
        )
      }
    })

    ou.accounts.forEach((account) => {
      account.configSets.forEach((configSetName) => {
        if (!configSetNames.includes(configSetName)) {
          throw new TakomoError(
            `Account '${account.id}' refers to a non-existing config set '${configSetName}'`,
          )
        }
      })

      account.bootstrapConfigSets.forEach((configSetName) => {
        if (!configSetNames.includes(configSetName)) {
          throw new TakomoError(
            `Account '${account.id}' refers to a non-existing bootstrap config set '${configSetName}'`,
          )
        }
      })

      account.policies.serviceControl.attached.forEach((policyName) => {
        if (!serviceControlPolicyNames.includes(policyName)) {
          throw new TakomoError(
            `Account '${account.id}' refers to a non-existing service control policy '${policyName}'`,
          )
        }
      })

      account.policies.tag.attached.forEach((policyName) => {
        if (!tagPolicyNames.includes(policyName)) {
          throw new TakomoError(
            `Account '${account.id}' refers to a non-existing tag policy '${policyName}'`,
          )
        }
      })

      account.policies.aiServicesOptOut.attached.forEach((policyName) => {
        if (!aiServicesOptOutPolicyNames.includes(policyName)) {
          throw new TakomoError(
            `Account '${account.id}' refers to a non-existing AI services opt-out policy '${policyName}'`,
          )
        }
      })

      account.policies.backup.attached.forEach((policyName) => {
        if (!backupPolicyNames.includes(policyName)) {
          throw new TakomoError(
            `Account '${account.id}' refers to a non-existing backup policy '${policyName}'`,
          )
        }
      })
    })

    ou.children.forEach(validateOu)
  }

  const ous = collectFromHierarchy(Root, (o) => o.children)
  ous.forEach(validateOu)

  ous.reduce((collected, ou) => {
    const accountIds = ou.accounts.map((a) => a.id)
    accountIds.forEach((accountId) => {
      if (collected.includes(accountId)) {
        throw new TakomoError(`Account ${accountId} is defined more than once`)
      }
    })

    return [...collected, ...accountIds]
  }, new Array<string>())
}

export const validateCommonLocalConfiguration = async (
  ctx: OrganizationContext,
  currentAccounts: Account[],
): Promise<void> => {
  const allAccountsInConfig = flatten(
    collectFromHierarchy(
      ctx.getOrganizationalUnit("Root"),
      (node) => node.children,
    ).map((ou) => ou.accounts),
  )

  const allAccountIdsInConfig = allAccountsInConfig.map((a) => a.id)

  const currentAccountIds = currentAccounts.map((a) => a.Id!)
  const invalidAccountIds = allAccountIdsInConfig.filter(
    (id) => !currentAccountIds.includes(id),
  )
  if (invalidAccountIds.length > 0) {
    throw new NonExistingAccountsInLocalConfigError(invalidAccountIds)
  }

  const suspendedAccountsIds = currentAccounts
    .filter((a) => a.Status === "SUSPENDED")
    .map((a) => a.Id!)

  const suspendedAccountIdsInLocalConfig = allAccountsInConfig
    .filter(
      (a) =>
        suspendedAccountsIds.includes(a.id) &&
        a.status !== OrganizationAccountStatus.SUSPENDED,
    )
    .map((a) => a.id)
  if (suspendedAccountIdsInLocalConfig.length > 0) {
    throw new SuspendedAccountsInLocalConfigError(
      suspendedAccountIdsInLocalConfig,
    )
  }

  const accountIdsMissingFromLocalConfig = currentAccounts.filter(
    (a) => !allAccountIdsInConfig.includes(a.Id!),
  )
  if (accountIdsMissingFromLocalConfig.length > 0) {
    throw new AccountsMissingFromLocalConfigError(
      accountIdsMissingFromLocalConfig,
    )
  }

  const currentAccountsMap = new Map(currentAccounts.map((a) => [a.Id!, a]))

  allAccountsInConfig.forEach((localAccount) => {
    const currentAccount = currentAccountsMap.get(localAccount.id)!
    if (localAccount.email && localAccount.email !== currentAccount.Email!) {
      throw new TakomoError(
        `Account email '${localAccount.email}' configured in local config does not match with the current email '${currentAccount.Email}' for account ${localAccount.id}`,
      )
    }
    if (localAccount.name && localAccount.name !== currentAccount.Name!) {
      throw new TakomoError(
        `Account name '${localAccount.name}' configured in local config does not match with the current name '${currentAccount.Name}' for account ${localAccount.id}`,
      )
    }
  })
}
