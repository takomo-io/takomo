import { ConfigSetType } from "@takomo/config-sets"
import { AccountId, CommandStatus } from "@takomo/core"
import {
  OrganizationAccount,
  OrganizationAccountStatus,
  OrganizationalUnit,
  OrganizationalUnitPath,
  OrganizationalUnitStatus,
} from "@takomo/organization-config"
import {
  OrganizationContext,
  OrganizationState,
} from "@takomo/organization-context"
import { collectFromHierarchy } from "@takomo/util"
import flatten from "lodash.flatten"
import uniqBy from "lodash.uniqby"
import { confirmOperation } from "./confirm"
import {
  AccountsLaunchPlan,
  AccountsOperationOutput,
  LaunchAccountsDataHolder,
} from "./model"

export const planAccountsDeploy = async (
  ctx: OrganizationContext,
  organizationState: OrganizationState,
  organizationalUnits: OrganizationalUnitPath[],
  accountIds: AccountId[],
  configSetType: ConfigSetType,
): Promise<AccountsLaunchPlan> => {
  const { accounts } = organizationState
  const logger = ctx.getLogger()
  logger.debugObject("Plan accounts deploy with parameters:", {
    organizationalUnits,
    accountIds,
    configSetType,
  })

  const organizationalUnitsToLaunch =
    organizationalUnits.length === 0
      ? [ctx.getOrganizationalUnit("Root")]
      : organizationalUnits.reduce((collected, path) => {
          return [...collected, ctx.getOrganizationalUnit(path)]
        }, new Array<OrganizationalUnit>())

  const sortOus = (a: OrganizationalUnit, b: OrganizationalUnit): number => {
    const order = a.priority - b.priority
    return order !== 0 ? order : a.name.localeCompare(b.name)
  }

  const ousToLaunch: OrganizationalUnit[] = flatten(
    organizationalUnitsToLaunch.map((ou) =>
      flatten(
        collectFromHierarchy(ou, (o) => o.children, {
          sortSiblings: sortOus,
          filter: (o) => o.status === OrganizationalUnitStatus.ACTIVE,
        }),
      ),
    ),
  )

  const uniqueOusToLaunch = uniqBy(ousToLaunch, (o) => o.path).filter(
    (o) => o.status === OrganizationalUnitStatus.ACTIVE,
  )

  const accountsById = new Map(accounts.map((a) => [a.Id, a]))

  const hasConfigSets = (a: OrganizationAccount) => {
    switch (configSetType) {
      case ConfigSetType.BOOTSTRAP:
        return a.bootstrapConfigSets.length > 0
      case ConfigSetType.STANDARD:
        return a.configSets.length > 0
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
            a.status === OrganizationAccountStatus.ACTIVE &&
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

  logger.debugObject(
    `Organizational units to deploy:`,
    ous.map((o) => o.path),
  )

  return {
    hasChanges: ous.length > 0,
    organizationalUnits: ous,
    configSetType,
  }
}

export const planLaunch = async (
  holder: LaunchAccountsDataHolder,
): Promise<AccountsOperationOutput> => {
  const {
    io,
    watch,
    ctx,
    organizationState,
    input: { organizationalUnits, accountIds, configSetType },
  } = holder
  const childWatch = watch.startChild("plan")

  io.info("Plan operation")

  const plan = await planAccountsDeploy(
    ctx,
    organizationState,
    organizationalUnits,
    accountIds,
    configSetType,
  )

  if (!plan.hasChanges) {
    const message = "No accounts to process"
    io.info(message)
    childWatch.stop()
    return {
      message,
      results: [],
      success: true,
      status: CommandStatus.SKIPPED,
      watch: watch.stop(),
    }
  }

  childWatch.stop()

  return confirmOperation({
    ...holder,
    plan,
  })
}
