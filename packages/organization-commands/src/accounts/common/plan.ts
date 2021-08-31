import { AccountId } from "@takomo/aws-model"
import {
  ConfigSetName,
  ConfigSetStage,
  ConfigSetType,
} from "@takomo/config-sets"
import {
  OrganizationAccountConfig,
  OrganizationalUnitConfig,
} from "@takomo/organization-config"
import {
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { CommandPath } from "@takomo/stacks-model"
import {
  arrayToMap,
  collectFromHierarchy,
  TakomoError,
  TkmLogger,
} from "@takomo/util"
import R from "ramda"
import { AccountsPlan } from "./model"

export interface AccountsSelectionCriteria {
  readonly organizationalUnits: ReadonlyArray<OrganizationalUnitPath>
  readonly accountIds: ReadonlyArray<AccountId>
  readonly configSetType: ConfigSetType
  readonly configSetName?: ConfigSetName
  readonly commandPath?: CommandPath
}

export interface CreateAccountsPlanProps {
  readonly ctx: OrganizationContext
  readonly logger: TkmLogger
  readonly organizationState: OrganizationState
  readonly accountsSelectionCriteria: AccountsSelectionCriteria
}

export const createAccountsPlan = async ({
  ctx,
  logger,
  organizationState,
  accountsSelectionCriteria,
}: CreateAccountsPlanProps): Promise<AccountsPlan> => {
  const { accounts } = organizationState
  const {
    organizationalUnits,
    accountIds,
    configSetType,
    commandPath,
    configSetName,
  } = accountsSelectionCriteria

  logger.debugObject(
    "Create accounts plan with criteria:",
    () => accountsSelectionCriteria,
  )

  if (commandPath && !configSetName) {
    throw new TakomoError(
      "If you provide command path, you must provide config set, too",
    )
  }

  if (configSetName) {
    if (!ctx.hasConfigSet(configSetName)) {
      throw new TakomoError(`Config set '${configSetName}' not found`)
    }
  }

  const organizationalUnitsToLaunch =
    organizationalUnits.length === 0
      ? [ctx.getOrganizationalUnit("Root")]
      : organizationalUnits.reduce((collected, path) => {
          return [...collected, ctx.getOrganizationalUnit(path)]
        }, new Array<OrganizationalUnitConfig>())

  const sortOus = (
    a: OrganizationalUnitConfig,
    b: OrganizationalUnitConfig,
  ): number => {
    const order = a.priority - b.priority
    return order !== 0 ? order : a.name.localeCompare(b.name)
  }

  const ousToLaunch: OrganizationalUnitConfig[] = organizationalUnitsToLaunch
    .map((ou) =>
      collectFromHierarchy(ou, (o) => o.children, {
        sortSiblings: sortOus,
        filter: (o) => o.status === "active",
      }).flat(),
    )
    .flat()

  const uniqueOusToLaunch = R.uniqBy(R.prop("path"), ousToLaunch).filter(
    (o) => o.status === "active",
  )

  const accountsById = arrayToMap(accounts, R.prop("id"))

  const configSetNameMatches = (a: OrganizationAccountConfig): boolean => {
    if (configSetName === undefined) {
      return true
    }
    switch (configSetType) {
      case "standard":
        return a.configSets.some((cs) => cs.name === configSetName)
      case "bootstrap":
        return a.bootstrapConfigSets.some((cs) => cs.name === configSetName)
      default:
        throw new Error(`Unsupported config set type: ${configSetType}`)
    }
  }

  const hasConfigSets = (a: OrganizationAccountConfig) => {
    switch (configSetType) {
      case "bootstrap":
        return a.bootstrapConfigSets.length > 0
      case "standard":
        return a.configSets.length > 0
      default:
        throw new Error(`Unsupported config set type: ${configSetType}`)
    }
  }

  const hasConfigSetsWithStage = (
    a: OrganizationAccountConfig,
    stage?: ConfigSetStage,
  ) => {
    switch (configSetType) {
      case "bootstrap":
        return a.bootstrapConfigSets.some((c) => c.stage === stage)
      case "standard":
        return a.configSets.some((c) => c.stage === stage)
      default:
        throw new Error(`Unsupported config set type: ${configSetType}`)
    }
  }

  const ous = uniqueOusToLaunch
    .map((ou) => {
      return {
        path: ou.path,
        accountAdminRoleName: ou.accountAdminRoleName,
        accountBootstrapRoleName: ou.accountBootstrapRoleName,
        configSets: ou.configSets,
        bootstrapConfigSets: ou.bootstrapConfigSets,
        vars: ou.vars,
        accounts: ou.accounts.filter(
          (a) =>
            a.status === "active" &&
            hasConfigSets(a) &&
            configSetNameMatches(a) &&
            (accountIds.length === 0 || accountIds.includes(a.id)),
        ),
      }
    })
    .filter((ou) => ou.accounts.length > 0)
    .map((ou) => {
      const accounts = ou.accounts.map((config) => {
        const account = accountsById.get(config.id)!
        return {
          account,
          config,
        }
      })

      return {
        ...ou,
        accounts,
      }
    })

  const stageNames = ctx.getStages() ?? [undefined]

  const stages = stageNames
    .map((stage) => {
      return {
        stage,
        organizationalUnits: ous
          .map((ou) => ({
            ...ou,
            accounts: ou.accounts.filter((a) =>
              hasConfigSetsWithStage(a.config, stage),
            ),
          }))
          .filter((ou) => ou.accounts.length > 0),
      }
    })
    .filter((s) => s.organizationalUnits.length > 0)

  return {
    stages,
    configSetType,
  }
}
