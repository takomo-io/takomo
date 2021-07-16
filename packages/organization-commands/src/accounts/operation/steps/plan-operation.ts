import { AccountId } from "@takomo/aws-model"
import {
  ConfigSetInstruction,
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
import { arrayToMap, collectFromHierarchy } from "@takomo/util"
import R from "ramda"
import { AccountsLaunchPlan, AccountsOperationIO } from "../model"
import { OrganizationStateHolder } from "../states"
import { AccountsOperationStep } from "../steps"

const planAccountsDeploy = async (
  ctx: OrganizationContext,
  io: AccountsOperationIO,
  organizationState: OrganizationState,
  organizationalUnits: ReadonlyArray<OrganizationalUnitPath>,
  accountIds: ReadonlyArray<AccountId>,
  configSetType: ConfigSetType,
): Promise<AccountsLaunchPlan> => {
  const { accounts } = organizationState
  io.debugObject("Plan accounts deploy with parameters:", {
    organizationalUnits,
    accountIds,
    configSetType,
  })

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

  const getConfigSets = (
    a: OrganizationAccountConfig,
  ): ReadonlyArray<ConfigSetInstruction> => {
    switch (configSetType) {
      case "bootstrap":
        return a.bootstrapConfigSets
      case "standard":
        return a.configSets
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
    hasChanges: stages.length > 0,
    stages,
    configSetType,
  }
}

export const planOperation: AccountsOperationStep<OrganizationStateHolder> =
  async (state) => {
    const {
      transitions,
      io,
      ctx,
      organizationState,
      input: { organizationalUnits, accountIds, configSetType },
    } = state

    io.info("Plan operation")

    const accountsLaunchPlan = await planAccountsDeploy(
      ctx,
      io,
      organizationState,
      organizationalUnits,
      accountIds,
      configSetType,
    )

    if (!accountsLaunchPlan.hasChanges) {
      const message = "No accounts to process"
      return transitions.skipAccountsOperation({ ...state, message })
    }

    return transitions.confirmOperation({
      ...state,
      accountsLaunchPlan,
    })
  }
