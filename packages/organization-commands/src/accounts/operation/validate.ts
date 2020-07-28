import { AccountId } from "@takomo/core"
import {
  OrganizationalUnit,
  OrganizationalUnitPath,
  OrganizationalUnitStatus,
} from "@takomo/organization-config"
import {
  OrganizationContext,
  validateCommonLocalConfiguration,
} from "@takomo/organization-context"
import { collectFromHierarchy, TakomoError } from "@takomo/util"
import flatten from "lodash.flatten"
import uniqBy from "lodash.uniqby"
import { planOrganizationDeploy } from "../../deploy/plan/plan-organization-deploy"
import { AccountsOperationOutput, LaunchAccountsDataHolder } from "./model"
import { planLaunch } from "./plan"

const validateAccountsLaunchConfiguration = (
  ctx: OrganizationContext,
  organizationalUnits: OrganizationalUnitPath[],
  accountIds: AccountId[],
): void => {
  const organizationalUnitsToLaunch =
    organizationalUnits.length === 0
      ? [ctx.getOrganizationalUnit("Root")]
      : organizationalUnits.reduce((collected, path) => {
          return [...collected, ctx.getOrganizationalUnit(path)]
        }, new Array<OrganizationalUnit>())

  const ousToDeploy: OrganizationalUnit[] = flatten(
    organizationalUnitsToLaunch.map((ou) =>
      flatten(collectFromHierarchy(ou, (o) => o.children)),
    ),
  )

  const uniqueOusToDeploy = uniqBy(ousToDeploy, (o) => o.path).filter(
    (o) => o.status === OrganizationalUnitStatus.ACTIVE,
  )

  if (accountIds.length > 0) {
    const accountIdsToLaunch: string[] = flatten(
      uniqueOusToDeploy.map((ou) =>
        flatten(
          collectFromHierarchy(ou, (ou) => ou.children).map((ou) =>
            ou.accounts.map((a) => a.id),
          ),
        ),
      ),
    )

    accountIds.forEach((accountId) => {
      if (!accountIdsToLaunch.includes(accountId)) {
        throw new TakomoError(
          `Account ${accountId} not found from any organizational unit chosen to be deployed`,
        )
      }
    })
  }
}

export const validateLocalConfiguration = async (
  holder: LaunchAccountsDataHolder,
): Promise<AccountsOperationOutput> => {
  const {
    ctx,
    io,
    watch,
    input: { organizationalUnits, accountIds },
    organizationState,
  } = holder
  const childWatch = watch.startChild("validate")
  io.info("Validate configuration")

  await validateCommonLocalConfiguration(ctx, organizationState.accounts)
  const plan = await planOrganizationDeploy(ctx, organizationState)
  if (plan.hasChanges) {
    throw new TakomoError(
      `Local configuration does not match with the current organization state`,
    )
  }

  validateAccountsLaunchConfiguration(ctx, organizationalUnits, accountIds)

  childWatch.stop()

  return planLaunch(holder)
}
