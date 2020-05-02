import { ConfigSet } from "@takomo/config-sets"
import { CallerIdentity } from "@takomo/core"
import { collectFromHierarchy, TakomoError } from "@takomo/util"
import { Account, Organization } from "aws-sdk/clients/organizations"
import flatten from "lodash.flatten"
import { OrganizationContext } from "../context"
import {
  AccountsMissingFromLocalConfigError,
  NonExistingAccountsInLocalConfigError,
  SuspendedAccountsInLocalConfigError,
} from "../error"
import {
  OrganizationAccountStatus,
  OrganizationalUnit,
  OrganizationConfigFile,
  PolicyConfig,
} from "../model"

const collectPolicyNames = (policies: PolicyConfig[] | undefined): string[] =>
  policies ? policies.map(p => p.name) : []

const collectConfigSetNames = (configSets: ConfigSet[]): string[] =>
  configSets.map(r => r.name)

export const validateOrganizationConfigFile = (
  configFile: OrganizationConfigFile,
  masterCallerIdentity: CallerIdentity,
  organization: Organization,
): void => {
  const {
    serviceControlPolicies,
    tagPolicies,
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

    if (Root.serviceControlPolicies.length === 0) {
      throw new TakomoError(
        "Root organizational unit must have at least one service control policy attached when the organization has service control policies enabled",
      )
    }
  }

  const serviceControlPolicyNames = collectPolicyNames(
    serviceControlPolicies.policies,
  )
  const tagPolicyNames = collectPolicyNames(tagPolicies.policies)
  const configSetNames = collectConfigSetNames(configSets)

  const validateOu = (ou: OrganizationalUnit): void => {
    ou.serviceControlPolicies.forEach(policyName => {
      if (!serviceControlPolicyNames.includes(policyName)) {
        throw new TakomoError(
          `Organizational unit '${ou.path}' refers to a non-existing service control policy '${policyName}'`,
        )
      }
    })

    ou.tagPolicies.forEach(policyName => {
      if (!tagPolicyNames.includes(policyName)) {
        throw new TakomoError(
          `Organizational unit '${ou.path}' refers to a non-existing tag policy '${policyName}'`,
        )
      }
    })

    ou.configSets.forEach(configSetName => {
      if (!configSetNames.includes(configSetName)) {
        throw new TakomoError(
          `Organizational unit '${ou.path}' refers to a non-existing config set '${configSetName}'`,
        )
      }
    })

    ou.bootstrapConfigSets.forEach(configSetName => {
      if (!configSetNames.includes(configSetName)) {
        throw new TakomoError(
          `Organizational unit '${ou.path}' refers to a non-existing bootstrap config set '${configSetName}'`,
        )
      }
    })

    ou.accounts.forEach(account => {
      account.configSets.forEach(configSetName => {
        if (!configSetNames.includes(configSetName)) {
          throw new TakomoError(
            `Account '${account.id}' refers to a non-existing config set '${configSetName}'`,
          )
        }
      })

      account.bootstrapConfigSets.forEach(configSetName => {
        if (!configSetNames.includes(configSetName)) {
          throw new TakomoError(
            `Account '${account.id}' refers to a non-existing bootstrap config set '${configSetName}'`,
          )
        }
      })
    })

    ou.children.forEach(validateOu)
  }

  const ous = collectFromHierarchy(Root, o => o.children)
  ous.forEach(validateOu)

  ous.reduce((collected, ou) => {
    const accountIds = ou.accounts.map(a => a.id)
    accountIds.forEach(accountId => {
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
      node => node.children,
    ).map(ou => ou.accounts),
  )

  const allAccountIdsInConfig = allAccountsInConfig.map(a => a.id)

  const currentAccountIds = currentAccounts.map(a => a.Id!)
  const invalidAccountIds = allAccountIdsInConfig.filter(
    id => !currentAccountIds.includes(id),
  )
  if (invalidAccountIds.length > 0) {
    throw new NonExistingAccountsInLocalConfigError(invalidAccountIds)
  }

  const suspendedAccountsIds = currentAccounts
    .filter(a => a.Status === "SUSPENDED")
    .map(a => a.Id!)

  const suspendedAccountIdsInLocalConfig = allAccountsInConfig
    .filter(
      a =>
        suspendedAccountsIds.includes(a.id) &&
        a.status !== OrganizationAccountStatus.SUSPENDED,
    )
    .map(a => a.id)
  if (suspendedAccountIdsInLocalConfig.length > 0) {
    throw new SuspendedAccountsInLocalConfigError(
      suspendedAccountIdsInLocalConfig,
    )
  }

  const accountIdsMissingFromLocalConfig = currentAccounts.filter(
    a => !allAccountIdsInConfig.includes(a.Id!),
  )
  if (accountIdsMissingFromLocalConfig.length > 0) {
    throw new AccountsMissingFromLocalConfigError(
      accountIdsMissingFromLocalConfig,
    )
  }

  const currentAccountsMap = new Map(currentAccounts.map(a => [a.Id!, a]))

  allAccountsInConfig.forEach(localAccount => {
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
