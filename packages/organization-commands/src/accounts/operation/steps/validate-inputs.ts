import { OrganizationalUnitConfig } from "@takomo/organization-config"
import { collectFromHierarchy, TakomoError } from "@takomo/util"
import R from "ramda"
import { InitialAccountsOperationState } from "../states"
import { AccountsOperationStep } from "../steps"

export const validateInputs: AccountsOperationStep<InitialAccountsOperationState> =
  async (state) => {
    const {
      transitions,
      ctx,
      input: { organizationalUnits, accountIds },
    } = state

    const organizationalUnitsToLaunch =
      organizationalUnits.length === 0
        ? [ctx.getOrganizationalUnit("Root")]
        : organizationalUnits.reduce((collected, path) => {
            return [...collected, ctx.getOrganizationalUnit(path)]
          }, new Array<OrganizationalUnitConfig>())

    const ousToDeploy: OrganizationalUnitConfig[] = organizationalUnitsToLaunch
      .map((ou) => collectFromHierarchy(ou, (o) => o.children).flat())
      .flat()

    const uniqueOusToDeploy = R.uniqBy(R.prop("path"), ousToDeploy).filter(
      (o) => o.status === "active",
    )

    if (accountIds.length > 0) {
      const accountIdsToLaunch: string[] = uniqueOusToDeploy
        .map((ou) =>
          collectFromHierarchy(ou, (ou) => ou.children)
            .map((ou) => ou.accounts.map((a) => a.id))
            .flat(),
        )
        .flat()

      accountIds.forEach((accountId) => {
        if (!accountIdsToLaunch.includes(accountId)) {
          throw new TakomoError(
            `Account ${accountId} not found from any organizational unit chosen to be deployed`,
          )
        }
      })
    }

    return transitions.loadOrganizationData(state)
  }
