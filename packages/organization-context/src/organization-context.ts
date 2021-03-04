import {
  createOrganizationsClient,
  CredentialManager,
  OrganizationsClient,
} from "@takomo/aws-clients"
import { AccountId } from "@takomo/aws-model"
import { ConfigSet, ConfigSetName } from "@takomo/config-sets"
import { InternalCommandContext } from "@takomo/core"
import {
  OrganizationalUnitConfig,
  OrganizationConfig,
} from "@takomo/organization-config"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { collectFromHierarchy, deepFreeze, TkmLogger } from "@takomo/util"
import { OrganizationConfigRepository } from "./model"

interface AccountConfig {
  accountAdminRoleName: string
}

const findConfigForAccount = (
  accountId: AccountId,
  ou: OrganizationalUnitConfig,
  config: AccountConfig,
): AccountConfig | null => {
  const updatedConfig = {
    ...config,
    accountAdminRoleName:
      ou.accountAdminRoleName || config.accountAdminRoleName,
  }

  const found = ou.accounts.find((a) => a.id === accountId)
  if (found) {
    const accountAdminRoleName =
      found.accountAdminRoleName || updatedConfig.accountAdminRoleName
    return {
      ...config,
      accountAdminRoleName,
    }
  }

  for (const child of ou.children) {
    const found = findConfigForAccount(accountId, child, updatedConfig)
    if (found) {
      return found
    }
  }

  return null
}

export interface OrganizationContext extends InternalCommandContext {
  getClient: () => OrganizationsClient
  hasOrganizationalUnit: (path: OrganizationalUnitPath) => boolean
  getOrganizationalUnit: (
    path: OrganizationalUnitPath,
  ) => OrganizationalUnitConfig
  getAdminRoleNameForAccount: (accountId: AccountId) => string
  organizationConfig: OrganizationConfig
  getConfigSet: (name: ConfigSetName) => ConfigSet
  configRepository: OrganizationConfigRepository
  credentialManager: CredentialManager
  commandContext: InternalCommandContext
}

export interface OrganizationContextProps {
  readonly organizationAdminCredentialManager: CredentialManager
  readonly credentialManager: CredentialManager
  readonly organizationConfig: OrganizationConfig
  readonly ctx: InternalCommandContext
  readonly configRepository: OrganizationConfigRepository
  readonly logger: TkmLogger
}

export const createOrganizationContext = ({
  ctx,
  configRepository,
  organizationAdminCredentialManager,
  organizationConfig,
  logger,
  credentialManager,
}: OrganizationContextProps): OrganizationContext => {
  const organizationalUnits = collectFromHierarchy(
    organizationConfig.organizationalUnits.Root,
    (o) => o.children,
  )

  const getClient = (): OrganizationsClient =>
    createOrganizationsClient({
      region: "us-east-1",
      credentialManager: organizationAdminCredentialManager,
      logger: logger.childLogger("http"),
    })

  const hasOrganizationalUnit = (path: OrganizationalUnitPath): boolean =>
    organizationalUnits.some((ou) => ou.path === path)

  const getOrganizationalUnit = (
    path: OrganizationalUnitPath,
  ): OrganizationalUnitConfig => {
    const ou = organizationalUnits.find((ou) => ou.path === path)
    if (!ou) {
      throw new Error(`No such organizational unit: '${path}'`)
    }

    return ou
  }

  const getAdminRoleNameForAccount = (accountId: AccountId): string => {
    const root = getOrganizationalUnit("Root")
    const accountConfig = findConfigForAccount(accountId, root, {
      accountAdminRoleName:
        root.accountAdminRoleName ||
        organizationConfig.accountAdminRoleName ||
        organizationConfig.accountCreation.defaults.roleName,
    })

    if (!accountConfig) {
      throw new Error(`No such account: '${accountId}'`)
    }

    return accountConfig.accountAdminRoleName
  }

  const getConfigSet = (name: string): ConfigSet => {
    const configSet = organizationConfig.configSets.find((r) => r.name === name)
    if (!configSet) {
      throw new Error(`No such config set: ${name}`)
    }

    return configSet
  }

  return deepFreeze({
    ...ctx,
    getClient,
    hasOrganizationalUnit,
    getOrganizationalUnit,
    getAdminRoleNameForAccount,
    organizationConfig,
    getConfigSet,
    configRepository,
    credentialManager,
    commandContext: ctx,
  })
}
