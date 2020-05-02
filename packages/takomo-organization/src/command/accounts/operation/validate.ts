import { AccountId } from "@takomo/core"
import { collectFromHierarchy, TakomoError } from "@takomo/util"
import flatten from "lodash.flatten"
import uniqBy from "lodash.uniqby"
import { OrganizationContext } from "../../../context"
import {
  OrganizationalUnit,
  OrganizationalUnitPath,
  OrganizationalUnitStatus,
} from "../../../model"
import { planOrganizationLaunch } from "../../../plan"
import { validateCommonLocalConfiguration } from "../../../validation"
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
    organizationData,
  } = holder
  const childWatch = watch.startChild("validate")
  io.info("Validate configuration")

  await validateCommonLocalConfiguration(ctx, organizationData.currentAccounts)
  const plan = await planOrganizationLaunch(ctx, organizationData)
  if (plan.hasChanges) {
    throw new TakomoError(
      `Local configuration does not match with the current organization state`,
    )
  }

  validateAccountsLaunchConfiguration(ctx, organizationalUnits, accountIds)

  childWatch.stop()

  return planLaunch(holder)
}
