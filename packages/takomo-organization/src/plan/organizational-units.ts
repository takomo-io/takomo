import { DetailedOrganizationalUnit } from "@takomo/aws-clients"
import { Logger } from "@takomo/util"
import {
  Account,
  OrganizationalUnitId,
  PolicyName,
} from "aws-sdk/clients/organizations"
import intersection from "lodash.intersection"
import uniq from "lodash.uniq"
import without from "lodash.without"
import { OrganizationContext } from "../context"
import {
  OrganizationAccount,
  OrganizationalUnit,
  OrganizationalUnitPath,
  OrganizationalUnitsDeploymentPlan,
  OrganizationData,
  PlannedAccount,
  PlannedOrganizationalUnit,
} from "../model"

const planAccountUpdate = (
  account: Account,
  localAccount: OrganizationAccount,
  currentServiceControlPoliciesByTarget: Map<string, PolicyName[]>,
  currentTagPoliciesByTarget: Map<string, PolicyName[]>,
  inheritedServiceControlPolicies: PolicyName[],
  inheritedTagPolicies: PolicyName[],
): PlannedAccount => {
  const id = account.Id!

  const localServiceControlPolicies = uniq([
    ...inheritedServiceControlPolicies,
    ...localAccount.serviceControlPolicies,
  ])
  const localTagPolicies = uniq([
    ...inheritedTagPolicies,
    ...localAccount.tagPolicies,
  ])

  const currentServiceControlPolicyNames =
    currentServiceControlPoliciesByTarget.get(id) || []
  const currentTagPolicyNames = currentTagPoliciesByTarget.get(id) || []

  const serviceControlPoliciesToRemove = without(
    currentServiceControlPolicyNames,
    ...localServiceControlPolicies,
  )

  const tagPoliciesToRemove = without(
    currentTagPolicyNames,
    ...localTagPolicies,
  )

  const serviceControlPoliciesToAdd = without(
    localServiceControlPolicies,
    ...currentServiceControlPolicyNames,
  )

  const tagPoliciesToAdd = without(localTagPolicies, ...currentTagPolicyNames)

  const tagPoliciesToRetain = intersection(
    currentTagPolicyNames,
    localTagPolicies,
  )

  const serviceControlPoliciesToRetain = intersection(
    currentServiceControlPolicyNames,
    localServiceControlPolicies,
  )

  const operation =
    serviceControlPoliciesToAdd.length > 0 ||
    serviceControlPoliciesToRemove.length > 0 ||
    tagPoliciesToAdd.length > 0 ||
    tagPoliciesToRemove.length > 0
      ? "update"
      : "skip"

  return {
    operation,
    id: account.Id!,
    serviceControlPolicies: {
      add: serviceControlPoliciesToAdd,
      retain: serviceControlPoliciesToRetain,
      remove: serviceControlPoliciesToRemove,
    },
    tagPolicies: {
      add: tagPoliciesToAdd,
      retain: tagPoliciesToRetain,
      remove: tagPoliciesToRemove,
    },
  }
}

export const createOrganizationalUnitsDeploymentPlan = (
  logger: Logger,
  ouPath: OrganizationalUnitPath,
  localOu: OrganizationalUnit | null,
  currentOu: DetailedOrganizationalUnit | null,
  currentAccounts: Account[],
  currentServiceControlPoliciesByTarget: Map<string, PolicyName[]>,
  currentTagPoliciesByTarget: Map<string, PolicyName[]>,
  parentId: OrganizationalUnitId | null,
  inheritedServiceControlPolicies: PolicyName[],
  inheritedTagPolicies: PolicyName[],
): PlannedOrganizationalUnit => {
  // Delete
  if (!localOu && currentOu) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return planOrganizationalUnitDelete(
      logger,
      ouPath,
      currentOu,
      currentAccounts,
      currentServiceControlPoliciesByTarget,
      currentTagPoliciesByTarget,
      parentId,
    )
    // Add
  } else if (localOu && !currentOu) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return planOrganizationalUnitAdd(
      logger,
      ouPath,
      localOu,
      currentAccounts,
      currentServiceControlPoliciesByTarget,
      currentTagPoliciesByTarget,
      parentId,
      inheritedServiceControlPolicies,
      inheritedTagPolicies,
    )

    // Update or skip
  } else if (localOu && currentOu) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return planOrganizationalUnitUpdate(
      logger,
      ouPath,
      localOu,
      currentOu,
      currentAccounts,
      currentServiceControlPoliciesByTarget,
      currentTagPoliciesByTarget,
      parentId,
      inheritedServiceControlPolicies,
      inheritedTagPolicies,
    )
  } else {
    throw new Error(`Assertion error`)
  }
}

const planOrganizationalUnitDelete = (
  logger: Logger,
  ouPath: string,
  currentOu: DetailedOrganizationalUnit,
  currentAccounts: Account[],
  currentServiceControlPoliciesByTarget: Map<string, PolicyName[]>,
  currentTagPoliciesByTarget: Map<string, PolicyName[]>,
  parentId: string | null,
): PlannedOrganizationalUnit => {
  const children = currentOu.children.map((child) =>
    createOrganizationalUnitsDeploymentPlan(
      logger,
      `${ouPath}/${child.ou.Name}`,
      null,
      child,
      currentAccounts,
      currentServiceControlPoliciesByTarget,
      currentTagPoliciesByTarget,
      currentOu.ou.Id!,
      [],
      [],
    ),
  )

  return {
    path: ouPath,
    priority: 0,
    children,
    parentId,
    id: currentOu.ou.Id!,
    currentName: currentOu.ou.Name!,
    newName: null,
    operation: "delete",
    serviceControlPolicies: {
      add: [],
      retain: [],
      remove: [],
    },
    tagPolicies: {
      add: [],
      retain: [],
      remove: [],
    },
    accounts: {
      add: [],
      retain: [],
      remove: currentOu.accounts.map((a) => ({
        id: a.Id!,
        operation: "skip",
        serviceControlPolicies: {
          add: [],
          retain: [],
          remove: [],
        },
        tagPolicies: {
          add: [],
          retain: [],
          remove: [],
        },
      })),
    },
  }
}

const planOrganizationalUnitAdd = (
  logger: Logger,
  ouPath: OrganizationalUnitPath,
  localOu: OrganizationalUnit,
  currentAccounts: Account[],
  currentServiceControlPoliciesByTarget: Map<string, PolicyName[]>,
  currentTagPoliciesByTarget: Map<string, PolicyName[]>,
  parentId: OrganizationalUnitId | null,
  inheritedServiceControlPolicies: PolicyName[],
  inheritedTagPolicies: PolicyName[],
): PlannedOrganizationalUnit => {
  logger.debug(`Plan creation of organizational unit: '${ouPath}'`)

  const children = localOu.children
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map((localChild) =>
      createOrganizationalUnitsDeploymentPlan(
        logger,
        localChild.path,
        localChild,
        null,
        currentAccounts,
        currentServiceControlPoliciesByTarget,
        currentTagPoliciesByTarget,
        null,
        uniq([
          ...inheritedServiceControlPolicies,
          ...localOu.serviceControlPolicies,
        ]),
        uniq([...inheritedTagPolicies, ...localOu.tagPolicies]),
      ),
    )

  return {
    children,
    parentId,
    path: ouPath,
    priority: localOu.priority,
    id: null,
    currentName: null,
    newName: localOu.name,
    operation: "add",
    serviceControlPolicies: {
      add: uniq([
        ...localOu.serviceControlPolicies,
        ...inheritedServiceControlPolicies,
      ]),
      retain: [],
      remove: [],
    },
    tagPolicies: {
      add: uniq([...localOu.tagPolicies, ...inheritedTagPolicies]),
      retain: [],
      remove: [],
    },
    accounts: {
      add: localOu.accounts.map((account) =>
        planAccountUpdate(
          currentAccounts.find((a) => a.Id === account.id)!,
          account,
          currentServiceControlPoliciesByTarget,
          currentTagPoliciesByTarget,
          inheritedServiceControlPolicies,
          inheritedTagPolicies,
        ),
      ),
      retain: [],
      remove: [],
    },
  }
}

const planOrganizationalUnitUpdate = (
  logger: Logger,
  ouPath: OrganizationalUnitPath,
  localOu: OrganizationalUnit,
  currentOu: DetailedOrganizationalUnit,
  currentAccounts: Account[],
  currentServiceControlPoliciesByTarget: Map<string, PolicyName[]>,
  currentTagPoliciesByTarget: Map<string, PolicyName[]>,
  parentId: OrganizationalUnitId | null,
  inheritedServiceControlPolicies: PolicyName[],
  inheritedTagPolicies: PolicyName[],
): PlannedOrganizationalUnit => {
  logger.debug(`Plan update for organizational unit: '${ouPath}'`)

  const currentAccountIds = currentOu.accounts.map((a) => a.Id!)
  const localAccountIds = localOu.accounts.map((a) => a.id)
  const currentServiceControlPolicyNames =
    currentServiceControlPoliciesByTarget.get(currentOu.ou.Id!) || []
  const currentTagPolicyNames =
    currentTagPoliciesByTarget.get(currentOu.ou.Id!) || []

  logger.debugObject(`Organizational unit '${ouPath}' policy configuration:`, {
    current: {
      tagPolicies: currentTagPolicyNames,
      serviceControlPolicies: currentServiceControlPolicyNames,
    },
    inherited: {
      tagPolicies: inheritedTagPolicies,
      serviceControlPolicies: inheritedServiceControlPolicies,
    },
    local: {
      tagPolicies: localOu.tagPolicies,
      serviceControlPolicies: localOu.serviceControlPolicies,
    },
  })

  const localServiceControlPolicies = uniq([
    ...inheritedServiceControlPolicies,
    ...localOu.serviceControlPolicies,
  ])
  const localTagPolicies = uniq([
    ...inheritedTagPolicies,
    ...localOu.tagPolicies,
  ])

  const serviceControlPoliciesToRemove = without(
    currentServiceControlPolicyNames,
    ...localServiceControlPolicies,
  )

  const tagPoliciesToRemove = without(
    currentTagPolicyNames,
    ...localTagPolicies,
  )

  const serviceControlPoliciesToAdd = without(
    localServiceControlPolicies,
    ...currentServiceControlPolicyNames,
  )

  const tagPoliciesToAdd = without(localTagPolicies, ...currentTagPolicyNames)

  const tagPoliciesToRetain = intersection(
    currentTagPolicyNames,
    localTagPolicies,
  )

  const serviceControlPoliciesToRetain = intersection(
    currentServiceControlPolicyNames,
    localServiceControlPolicies,
  )

  logger.debugObject(`Organizational unit '${ouPath}' policy operations:`, {
    add: {
      tagPolicies: tagPoliciesToAdd,
      serviceControlPolicies: serviceControlPoliciesToAdd,
    },
    retain: {
      tagPolicies: tagPoliciesToRetain,
      serviceControlPolicies: serviceControlPoliciesToRetain,
    },
    remove: {
      tagPolicies: tagPoliciesToRemove,
      serviceControlPolicies: serviceControlPoliciesToRemove,
    },
  })

  const policiesChanged = (): boolean =>
    [
      serviceControlPoliciesToRemove,
      tagPoliciesToRemove,
      serviceControlPoliciesToAdd,
      tagPoliciesToAdd,
    ].reduce((sum, policies) => sum + policies.length, 0) > 0

  const accountIdsToAdd = without(localAccountIds, ...currentAccountIds)
  const accountIdsToRemove = without(currentAccountIds, ...localAccountIds)
  const accountIdsToRetain = intersection(currentAccountIds, localAccountIds)

  const accountsToAdd = accountIdsToAdd.map((id) => {
    return planAccountUpdate(
      currentAccounts.find((a) => a.Id === id)!,
      localOu.accounts.find((a) => a.id === id)!,
      currentServiceControlPoliciesByTarget,
      currentTagPoliciesByTarget,
      inheritedServiceControlPolicies,
      inheritedTagPolicies,
    )
  })

  const accountsToRetain = accountIdsToRetain.map((id) => {
    return planAccountUpdate(
      currentAccounts.find((a) => a.Id === id)!,
      localOu.accounts.find((a) => a.id === id)!,
      currentServiceControlPoliciesByTarget,
      currentTagPoliciesByTarget,
      inheritedServiceControlPolicies,
      inheritedTagPolicies,
    )
  })

  const accountsToRemove = accountIdsToRemove.map((id) => {
    return {
      operation: "skip",
      id,
      serviceControlPolicies: {
        add: [],
        retain: [],
        remove: [],
      },
      tagPolicies: {
        add: [],
        retain: [],
        remove: [],
      },
    }
  })

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
          localChild.path,
          localChild,
          currentChild,
          currentAccounts,
          currentServiceControlPoliciesByTarget,
          currentTagPoliciesByTarget,
          currentOu.ou.Id!,
          localServiceControlPolicies,
          localTagPolicies,
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
          `${ouPath}/${currentChild.ou.Name}`,
          null,
          currentChild,
          currentAccounts,
          currentServiceControlPoliciesByTarget,
          currentTagPoliciesByTarget,
          currentOu?.ou.Id!,
          [],
          [],
        ),
      ) || []

  const operation =
    localOu?.name !== currentOu?.ou.Name ||
    policiesChanged() ||
    accountsChanged()
      ? "update"
      : "skip"

  return {
    parentId,
    operation,
    children: [...children, ...deletedChildren],
    path: ouPath,
    priority: localOu.priority,
    id: currentOu.ou.Id!,
    currentName: currentOu.ou.Name!,
    newName: localOu.name,
    serviceControlPolicies: {
      add: serviceControlPoliciesToAdd,
      retain: serviceControlPoliciesToRetain,
      remove: serviceControlPoliciesToRemove,
    },
    tagPolicies: {
      add: tagPoliciesToAdd,
      retain: tagPoliciesToRetain,
      remove: tagPoliciesToRemove,
    },
    accounts: {
      add: accountsToAdd,
      retain: accountsToRetain,
      remove: accountsToRemove,
    },
  }
}

export const planOrganizationUnitsDeployment = async (
  ctx: OrganizationContext,
  data: OrganizationData,
): Promise<OrganizationalUnitsDeploymentPlan> => {
  const {
    currentRootOrganizationalUnit,
    currentAccounts,
    currentServiceControlPoliciesByTarget,
    currentTagPoliciesByTarget,
  } = data

  const configFile = ctx.getOrganizationConfigFile()
  const {
    organizationalUnits: { Root },
  } = configFile

  const root = createOrganizationalUnitsDeploymentPlan(
    ctx.getLogger(),
    "Root",
    Root,
    currentRootOrganizationalUnit,
    currentAccounts,
    currentServiceControlPoliciesByTarget,
    currentTagPoliciesByTarget,
    null,
    [],
    [],
  )

  const hasChanges = (ou: PlannedOrganizationalUnit): boolean => {
    if (ou.operation !== "skip") {
      return true
    }

    return ou.children.find((c) => hasChanges(c)) !== undefined
  }

  return {
    hasChanges: hasChanges(root),
    root,
  }
}
