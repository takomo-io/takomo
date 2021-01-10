import { AccountId } from "@takomo/aws-model"
import { OrganizationalUnitConfig } from "@takomo/organization-config"
import {
  OrganizationContext,
  validateCommonLocalConfiguration,
} from "@takomo/organization-context"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { collectFromHierarchy, TakomoError } from "@takomo/util"
import flatten from "lodash.flatten"
import uniqBy from "lodash.uniqby"
import { OrganizationStateHolder } from "../states"
import { AccountsOperationStep } from "../steps"

const validateAccountsLaunchConfiguration = (
  ctx: OrganizationContext,
  organizationalUnits: ReadonlyArray<OrganizationalUnitPath>,
  accountIds: ReadonlyArray<AccountId>,
): void => {
  const organizationalUnitsToLaunch =
    organizationalUnits.length === 0
      ? [ctx.getOrganizationalUnit("Root")]
      : organizationalUnits.reduce((collected, path) => {
          return [...collected, ctx.getOrganizationalUnit(path)]
        }, new Array<OrganizationalUnitConfig>())

  const ousToDeploy: OrganizationalUnitConfig[] = flatten(
    organizationalUnitsToLaunch.map((ou) =>
      flatten(collectFromHierarchy(ou, (o) => o.children)),
    ),
  )

  const uniqueOusToDeploy = uniqBy(ousToDeploy, (o) => o.path).filter(
    (o) => o.status === "active",
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

export const validateConfiguration: AccountsOperationStep<OrganizationStateHolder> = async (
  state,
) => {
  const {
    transitions,
    ctx,
    io,
    input: { organizationalUnits, accountIds },
    organizationState,
  } = state

  io.info("Validate configuration")

  await validateCommonLocalConfiguration(ctx, organizationState.accounts)

  validateAccountsLaunchConfiguration(ctx, organizationalUnits, accountIds)

  return transitions.planOperation(state)
}
