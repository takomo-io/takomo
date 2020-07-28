import { DetailedOrganizationalUnit } from "@takomo/aws-clients"
import {
  OrganizationalUnit,
  OrganizationalUnitPath,
} from "@takomo/organization-config"
import { OrganizationState } from "@takomo/organization-context"
import { Logger } from "@takomo/util"
import { OrganizationalUnitId } from "aws-sdk/clients/organizations"
import intersection from "lodash.intersection"
import without from "lodash.without"
import { createEmptyOrgEntityPoliciesPlan } from "./create-empty-org-entity-policies-plan"
import { createOrgEntityPoliciesPlan } from "./create-org-entity-policies-plan"
import { createOrganizationalUnitsDeploymentPlan } from "./create-organizational-units-deployment-plan"
import {
  EnabledPoliciesPlan,
  PlannedAccount,
  PlannedOrganizationalUnit,
} from "./model"
import { planAccountUpdate } from "./plan-account-update"

export const planOrganizationalUnitUpdate = (
  logger: Logger,
  enabledPoliciesPlan: EnabledPoliciesPlan,
  ouPath: OrganizationalUnitPath,
  localOu: OrganizationalUnit,
  currentOu: DetailedOrganizationalUnit,
  organizationState: OrganizationState,
  parentId: OrganizationalUnitId | null,
): PlannedOrganizationalUnit => {
  logger.debug(
    `Plan update for OU with path: '${ouPath}', id: ${currentOu.ou.Id}`,
  )

  const policies = createOrgEntityPoliciesPlan(
    logger,
    currentOu.ou.Id!,
    localOu.policies,
    organizationState,
    enabledPoliciesPlan,
  )

  const currentAccountIds = currentOu.accounts.map((a) => a.Id!)
  const localAccountIds = localOu.accounts.map((a) => a.id)

  const accountIdsToAdd = without(localAccountIds, ...currentAccountIds)
  const accountIdsToRemove = without(currentAccountIds, ...localAccountIds)
  const accountIdsToRetain = intersection(currentAccountIds, localAccountIds)

  const accountsToAdd = accountIdsToAdd.map((id) => {
    return planAccountUpdate(
      logger,
      organizationState.getAccount(id),
      localOu.accounts.find((a) => a.id === id)!,
      organizationState,
      enabledPoliciesPlan,
    )
  })

  const accountsToRetain = accountIdsToRetain.map((id) => {
    return planAccountUpdate(
      logger,
      organizationState.getAccount(id),
      localOu.accounts.find((a) => a.id === id)!,
      organizationState,
      enabledPoliciesPlan,
    )
  })

  const accountsToRemove: PlannedAccount[] = accountIdsToRemove.map((id) => ({
    id,
    operation: "skip",
    policies: createEmptyOrgEntityPoliciesPlan(),
  }))

  const accountsChanged = (): boolean => {
    if (currentAccountIds.length !== localAccountIds.length) {
      return true
    }

    if (
      currentAccountIds.slice().sort().join(",") !==
      localAccountIds.slice().sort().join(",")
    ) {
      return true
    }

    return (
      [...accountsToAdd, ...accountsToRemove, ...accountsToRetain].find(
        (a) => a.operation === "update",
      ) !== undefined
    )
  }

  const children =
    localOu.children
      .slice()
      .sort((a, b) => a.priority - b.priority)
      .map((localChild) => {
        const currentChild =
          currentOu.children.find(
            (currentChild) => currentChild.ou.Name === localChild.name,
          ) || null
        return createOrganizationalUnitsDeploymentPlan(
          logger,
          enabledPoliciesPlan,
          localChild.path,
          localChild,
          currentChild,
          organizationState,
          currentOu.ou.Id!,
        )
      }) || []

  const deletedChildren =
    currentOu?.children
      .filter(
        (currentChild) =>
          localOu.children.find((l) => l.name === currentChild.ou.Name) ===
          undefined,
      )
      .map((currentChild) =>
        createOrganizationalUnitsDeploymentPlan(
          logger,
          enabledPoliciesPlan,
          `${ouPath}/${currentChild.ou.Name}`,
          null,
          currentChild,
          organizationState,
          currentOu?.ou.Id!,
        ),
      ) || []

  const operation =
    localOu?.name !== currentOu?.ou.Name ||
    policies.hasChanges ||
    accountsChanged()
      ? "update"
      : "skip"

  return {
    parentId,
    operation,
    policies,
    children: [...children, ...deletedChildren],
    path: ouPath,
    priority: localOu.priority,
    id: currentOu.ou.Id!,
    name: localOu.name,
    accounts: {
      add: accountsToAdd,
      retain: accountsToRetain,
      remove: accountsToRemove,
    },
  }
}
