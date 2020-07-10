import { OrganizationsClient } from "@takomo/aws-clients"
import {
  AccountId,
  CommandStatus,
  Constants,
  resolveCommandOutputBase,
} from "@takomo/core"
import { collectFromHierarchy, Logger } from "@takomo/util"
import {
  OrganizationalUnitId,
  PolicyId,
  PolicyName,
  PolicyType,
} from "aws-sdk/clients/organizations"
import flatten from "lodash.flatten"
import {
  OrganizationalUnitDeploymentResult,
  PlannedOrganizationalUnit,
  PoliciesDeploymentResultHolder,
} from "../../../model"
import { cleanOrganizationalUnits } from "../clean/organizational-units"
import { DeployOrganizationOutput } from "../model"

export const addOrUpdateOrganizationalUnits = async (
  logger: Logger,
  client: OrganizationsClient,
  enabledPolicyTypes: PolicyType[],
  serviceControlPoliciesJustEnabled: boolean,
  currentServiceControlPolicies: Map<PolicyName, PolicyId>,
  currentTagPolicies: Map<PolicyName, PolicyId>,
  currentAiServicesOptOutPolicies: Map<PolicyName, PolicyId>,
  currentAccounts: Map<AccountId, OrganizationalUnitId>,
  planned: PlannedOrganizationalUnit,
  parentId: OrganizationalUnitId | null,
): Promise<OrganizationalUnitDeploymentResult[]> => {
  switch (planned.operation) {
    case "add":
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return await addOrganizationalUnit(
        logger,
        client,
        enabledPolicyTypes,
        serviceControlPoliciesJustEnabled,
        currentServiceControlPolicies,
        currentTagPolicies,
        currentAiServicesOptOutPolicies,
        currentAccounts,
        planned,
        parentId!,
      )
    case "update":
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return updateOrganizationalUnit(
        logger,
        client,
        enabledPolicyTypes,
        serviceControlPoliciesJustEnabled,
        currentServiceControlPolicies,
        currentTagPolicies,
        currentAiServicesOptOutPolicies,
        currentAccounts,
        planned,
      )
    case "skip":
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return skipOrganizationalUnit(
        logger,
        client,
        enabledPolicyTypes,
        serviceControlPoliciesJustEnabled,
        currentServiceControlPolicies,
        currentTagPolicies,
        currentAiServicesOptOutPolicies,
        currentAccounts,
        planned,
      )
    default:
      return []
  }
}

const detachPolicies = async (
  logger: Logger,
  policyType: string,
  client: OrganizationsClient,
  targetType: string,
  targetId: string,
  policiesToDetach: string[],
  currentPolicies: Map<string, string>,
): Promise<boolean> => {
  if (policiesToDetach.length === 0) {
    logger.debug(
      `No policies of type '${policyType}' to detach from ${targetType} '${targetId}'`,
    )

    return true
  }

  logger.debug(
    `About to detach ${policiesToDetach.length} policies of type '${policyType}' from ${targetType} '${targetId}'`,
  )

  for (const policyName of policiesToDetach) {
    const policyId = currentPolicies.get(policyName)
    logger.debugObject(`Detach policy`, {
      policyId,
      policyType,
      policyName,
      targetId,
    })

    try {
      await client.detachPolicy({
        TargetId: targetId,
        PolicyId: policyId!,
      })
    } catch (e) {
      logger.error(
        `Failed to detach policy ${policyId} of type '${policyType}' from ${targetType} '${targetId}'`,
        e,
      )
      return false
    }
  }

  return true
}

const attachPolicies = async (
  logger: Logger,
  policyType: string,
  client: OrganizationsClient,
  targetType: string,
  targetId: string,
  policiesToAttach: string[],
  currentPolicies: Map<string, string>,
): Promise<boolean> => {
  if (policiesToAttach.length === 0) {
    logger.debug(
      `No policies of type '${policyType}' to attach to ${targetType} '${targetId}'`,
    )

    return true
  }

  logger.debug(
    `About to attach ${policiesToAttach.length} policies of type '${policyType}' to ${targetType} '${targetId}'`,
  )

  for (const policyName of policiesToAttach) {
    const policyId = currentPolicies.get(policyName)
    logger.debugObject("Attach policy", {
      policyId,
      policyType,
      policyName,
      targetId,
    })

    try {
      await client.attachPolicy({
        TargetId: targetId,
        PolicyId: policyId!,
      })
    } catch (e) {
      logger.error(
        `Failed to attach policy ${policyId} of type '${policyType}' to ${targetType} '${targetId}'`,
        e,
      )
      return false
    }
  }

  return true
}

const cancelOrganizationalUnits = (
  planned: PlannedOrganizationalUnit,
): OrganizationalUnitDeploymentResult[] => {
  const ou = {
    id: planned.id,
    name: planned.newName!,
    message: "Cancelled due to earlier failures",
    success: false,
    status: CommandStatus.CANCELLED,
  }

  return planned.children.reduce(
    (collected, child) => [...collected, ...cancelOrganizationalUnits(child)],
    [ou],
  )
}

const createOrganizationalUnit = async (
  logger: Logger,
  client: OrganizationsClient,
  planned: PlannedOrganizationalUnit,
  parentId: OrganizationalUnitId,
): Promise<OrganizationalUnitDeploymentResult> =>
  client
    .createOrganizationalUnit({
      Name: planned.newName!,
      ParentId: parentId!,
    })
    .then((res) => ({
      id: res.Id!,
      name: res.Name!,
      message: "Added",
      success: true,
      status: CommandStatus.SUCCESS,
    }))
    .catch((e) => {
      logger.error(
        `Failed to create new organizational unit '${planned.path}'`,
        e,
      )
      return {
        id: null,
        name: planned.newName!,
        message: e.message,
        success: false,
        status: CommandStatus.FAILED,
      }
    })

const attachAndDetachPolicies = async (
  logger: Logger,
  client: OrganizationsClient,
  enabledPolicyTypes: PolicyType[],
  serviceControlPoliciesJustEnabled: boolean,
  currentServiceControlPolicies: Map<PolicyName, PolicyId>,
  currentTagPolicies: Map<PolicyName, PolicyId>,
  currentAiServicesOptOutPolicies: Map<PolicyName, PolicyId>,
  targetType: string,
  targetId: string,
  servicePoliciesToAttach: PolicyName[],
  servicePoliciesToDetach: PolicyName[],
  tagPoliciesToAttach: PolicyName[],
  tagPoliciesToDetach: PolicyName[],
  aiServicesOptOutPoliciesToAttach: PolicyName[],
  aiServicesOptOutPoliciesToDetach: PolicyName[],
): Promise<boolean> => {
  if (enabledPolicyTypes.includes(Constants.SERVICE_CONTROL_POLICY_TYPE)) {
    // If service control policies were just enabled in organization,
    // then the default policy was attached to every OU and account,
    // and therefore it can be attached again here
    const policiesToAttach = serviceControlPoliciesJustEnabled
      ? servicePoliciesToAttach.filter(
          (p) => p !== Constants.DEFAULT_SERVICE_CONTROL_POLICY_NAME,
        )
      : servicePoliciesToAttach

    if (
      !(await attachPolicies(
        logger,
        Constants.SERVICE_CONTROL_POLICY_TYPE,
        client,
        targetType,
        targetId,
        policiesToAttach,
        currentServiceControlPolicies,
      ))
    ) {
      return false
    }
  }

  if (enabledPolicyTypes.includes(Constants.TAG_POLICY_TYPE)) {
    if (
      !(await attachPolicies(
        logger,
        Constants.TAG_POLICY_TYPE,
        client,
        targetType,
        targetId,
        tagPoliciesToAttach,
        currentTagPolicies,
      ))
    ) {
      return false
    }
  }

  if (enabledPolicyTypes.includes(Constants.AISERVICES_OPT_OUT_POLICY_TYPE)) {
    if (
      !(await attachPolicies(
        logger,
        Constants.AISERVICES_OPT_OUT_POLICY_TYPE,
        client,
        targetType,
        targetId,
        aiServicesOptOutPoliciesToAttach,
        currentAiServicesOptOutPolicies,
      ))
    ) {
      return false
    }
  }

  if (enabledPolicyTypes.includes(Constants.SERVICE_CONTROL_POLICY_TYPE)) {
    if (
      !(await detachPolicies(
        logger,
        Constants.SERVICE_CONTROL_POLICY_TYPE,
        client,
        targetType,
        targetId,
        servicePoliciesToDetach,
        currentServiceControlPolicies,
      ))
    ) {
      return false
    }
  }

  if (enabledPolicyTypes.includes(Constants.TAG_POLICY_TYPE)) {
    if (
      !(await detachPolicies(
        logger,
        Constants.TAG_POLICY_TYPE,
        client,
        targetType,
        targetId,
        tagPoliciesToDetach,
        currentTagPolicies,
      ))
    ) {
      return false
    }
  }

  if (enabledPolicyTypes.includes(Constants.AISERVICES_OPT_OUT_POLICY_TYPE)) {
    if (
      !(await detachPolicies(
        logger,
        Constants.AISERVICES_OPT_OUT_POLICY_TYPE,
        client,
        targetType,
        targetId,
        aiServicesOptOutPoliciesToDetach,
        currentAiServicesOptOutPolicies,
      ))
    ) {
      return false
    }
  }

  return true
}

const addOrganizationalUnit = async (
  logger: Logger,
  client: OrganizationsClient,
  enabledPolicyTypes: PolicyType[],
  serviceControlPoliciesJustEnabled: boolean,
  currentServiceControlPolicies: Map<PolicyName, PolicyId>,
  currentTagPolicies: Map<PolicyName, PolicyId>,
  currentAiServicesOptOutPolicies: Map<PolicyName, PolicyId>,
  currentAccounts: Map<AccountId, OrganizationalUnitId>,
  planned: PlannedOrganizationalUnit,
  parentId: OrganizationalUnitId,
): Promise<OrganizationalUnitDeploymentResult[]> => {
  const results = new Array<OrganizationalUnitDeploymentResult>()

  logger.info(`Create new organizational unit with path '${planned.path}'`)

  const addedOu: OrganizationalUnitDeploymentResult = await createOrganizationalUnit(
    logger,
    client,
    planned,
    parentId,
  )

  if (!addedOu.success) {
    logger.warn(
      `Creating of new organizational unit with path '${planned.path}' failed, cancel the remaining organizational units`,
    )
    return [
      ...results,
      addedOu,
      ...flatten(planned.children.map(cancelOrganizationalUnits)),
    ]
  }

  logger.info("Created new organizational unit", {
    path: planned.path,
    id: addedOu.id,
  })

  const initialPolicies = await client.listAllPoliciesForTarget(addedOu.id!)
  logger.debugObject(
    "New organizational unit has following initial policies",
    initialPolicies,
  )

  const initialServiceControlPolicies = initialPolicies.filter(
    (p) => p.Type === Constants.SERVICE_CONTROL_POLICY_TYPE,
  )
  const initialServiceControlPolicyNames = initialServiceControlPolicies.map(
    (p) => p.Name!,
  )
  const initialTagPolicies = initialPolicies.filter(
    (p) => p.Type === Constants.TAG_POLICY_TYPE,
  )
  const initialTagPolicyNames = initialTagPolicies.map((p) => p.Name!)

  const initialAiServicesOptOutPolicies = initialPolicies.filter(
    (p) => p.Type === Constants.AISERVICES_OPT_OUT_POLICY_TYPE,
  )

  const initialAiServicesOptOutPolicyNames = initialAiServicesOptOutPolicies.map(
    (p) => p.Name!,
  )

  const serviceControlPoliciesToAttach = planned.serviceControlPolicies.add.filter(
    (p) => !initialServiceControlPolicyNames.includes(p),
  )
  const serviceControlPoliciesToDetach = initialServiceControlPolicyNames.filter(
    (p) => !planned.serviceControlPolicies.add.includes(p),
  )
  const tagPoliciesToAttach = planned.tagPolicies.add.filter(
    (p) => !initialTagPolicyNames.includes(p),
  )
  const tagPoliciestToDetach = initialTagPolicyNames.filter(
    (p) => !planned.tagPolicies.add.includes(p),
  )
  const aiServicesOptOutPoliciesToAttach = planned.aiServicesOptOutPolicies.add.filter(
    (p) => !initialAiServicesOptOutPolicyNames.includes(p),
  )
  const aiServicesOptOutPoliciesToDetach = initialAiServicesOptOutPolicyNames.filter(
    (p) => !planned.aiServicesOptOutPolicies.add.includes(p),
  )

  if (
    !(await attachAndDetachPolicies(
      logger,
      client,
      enabledPolicyTypes,
      serviceControlPoliciesJustEnabled,
      currentServiceControlPolicies,
      currentTagPolicies,
      currentAiServicesOptOutPolicies,
      "organizational unit",
      addedOu.id!,
      serviceControlPoliciesToAttach,
      serviceControlPoliciesToDetach,
      tagPoliciesToAttach,
      tagPoliciestToDetach,
      aiServicesOptOutPoliciesToAttach,
      aiServicesOptOutPoliciesToDetach,
    ))
  ) {
    logger.warn(
      `Attaching and detaching policies for new organizational unit with path '${planned.path}' failed, cancel the remaining organizational units`,
    )
    return [
      ...results,
      {
        ...addedOu,
        success: false,
        status: CommandStatus.FAILED,
        message: "Policies failed",
      },
      ...flatten(planned.children.map(cancelOrganizationalUnits)),
    ]
  }

  for (const account of planned.accounts.add) {
    const accountId = account.id
    const currentOu = currentAccounts.get(accountId)!
    const newOu = addedOu.id!
    logger.info(
      `Move account '${accountId}' from organizational unit ${currentOu} to ${newOu}`,
    )

    if (
      !(await client.moveAccount({
        AccountId: accountId,
        DestinationParentId: newOu,
        SourceParentId: currentOu,
      }))
    ) {
      logger.warn(
        `Moving account '${accountId}' to new organizational unit with path '${planned.path}' failed, cancel the remaining organizational units`,
      )
      return [
        ...results,
        {
          ...addedOu,
          success: false,
          status: CommandStatus.FAILED,
          message: "Accounts failed",
        },
        ...flatten(planned.children.map(cancelOrganizationalUnits)),
      ]
    }

    if (
      !(await attachAndDetachPolicies(
        logger,
        client,
        enabledPolicyTypes,
        serviceControlPoliciesJustEnabled,
        currentServiceControlPolicies,
        currentTagPolicies,
        currentAiServicesOptOutPolicies,
        "account",
        accountId,
        account.serviceControlPolicies.add,
        account.serviceControlPolicies.remove,
        account.tagPolicies.add,
        account.tagPolicies.remove,
        account.aiServicesOptOutPolicies.add,
        account.aiServicesOptOutPolicies.remove,
      ))
    ) {
      logger.warn(
        `Attaching and detaching policies for account '${accountId}' of new organizational unit with path '${planned.path}' failed, cancel the remaining organizational units`,
      )
      return [
        ...results,
        {
          ...addedOu,
          success: false,
          status: CommandStatus.FAILED,
          message: "Accounts failed",
        },
        ...flatten(planned.children.map(cancelOrganizationalUnits)),
      ]
    }
  }

  results.push(addedOu)

  for (const child of planned.children) {
    const childResults = await addOrUpdateOrganizationalUnits(
      logger,
      client,
      enabledPolicyTypes,
      serviceControlPoliciesJustEnabled,
      currentServiceControlPolicies,
      currentTagPolicies,
      currentAiServicesOptOutPolicies,
      currentAccounts,
      child,
      addedOu.id,
    )
    childResults.forEach((c) => results.push(c))
  }

  return results
}

const updateOrganizationalUnit = async (
  logger: Logger,
  client: OrganizationsClient,
  enabledPolicyTypes: PolicyType[],
  serviceControlPoliciesJustEnabled: boolean,
  currentServiceControlPolicies: Map<PolicyName, PolicyId>,
  currentTagPolicies: Map<PolicyName, PolicyId>,
  currentAiServicesOptOutPolicies: Map<PolicyName, PolicyId>,
  currentAccounts: Map<AccountId, OrganizationalUnitId>,
  planned: PlannedOrganizationalUnit,
): Promise<OrganizationalUnitDeploymentResult[]> => {
  const results = new Array<OrganizationalUnitDeploymentResult>()

  logger.info(`Update organizational unit: ${planned.path}`)

  if (
    !(await attachAndDetachPolicies(
      logger,
      client,
      enabledPolicyTypes,
      serviceControlPoliciesJustEnabled,
      currentServiceControlPolicies,
      currentTagPolicies,
      currentAiServicesOptOutPolicies,
      "organizational unit",
      planned.id!,
      planned.serviceControlPolicies.add,
      planned.serviceControlPolicies.remove,
      planned.tagPolicies.add,
      planned.tagPolicies.remove,
      planned.aiServicesOptOutPolicies.add,
      planned.aiServicesOptOutPolicies.remove,
    ))
  ) {
    logger.warn(
      `Attaching and detaching policies for organizational unit with path '${planned.path}' failed, cancel the remaining organizational units`,
    )
    return [
      ...results,
      {
        id: planned.id!,
        name: planned.newName!,
        success: false,
        status: CommandStatus.FAILED,
        message: "Policies failed",
      },
      ...flatten(planned.children.map(cancelOrganizationalUnits)),
    ]
  }

  for (const account of [...planned.accounts.add]) {
    const accountId = account.id
    const currentOu = currentAccounts.get(accountId)!
    const newOu = planned.id!
    logger.info(
      `Move account ${accountId} from organizational unit ${currentOu} to ${newOu}`,
    )

    if (
      !(await client.moveAccount({
        AccountId: accountId,
        DestinationParentId: newOu,
        SourceParentId: currentOu,
      }))
    ) {
      logger.warn(
        `Moving account '${accountId}' to organizational unit with path '${planned.path}' failed, cancel the remaining organizational units`,
      )

      return [
        ...results,
        {
          id: planned.id!,
          name: planned.newName!,
          success: false,
          status: CommandStatus.FAILED,
          message: "Accounts failed",
        },
        ...flatten(planned.children.map(cancelOrganizationalUnits)),
      ]
    }
  }

  for (const account of [...planned.accounts.add, ...planned.accounts.retain]) {
    const accountId = account.id

    if (
      !(await attachAndDetachPolicies(
        logger,
        client,
        enabledPolicyTypes,
        serviceControlPoliciesJustEnabled,
        currentServiceControlPolicies,
        currentTagPolicies,
        currentAiServicesOptOutPolicies,
        "account",
        accountId,
        account.serviceControlPolicies.add,
        account.serviceControlPolicies.remove,
        account.tagPolicies.add,
        account.tagPolicies.remove,
        account.aiServicesOptOutPolicies.add,
        account.aiServicesOptOutPolicies.remove,
      ))
    ) {
      logger.warn(
        `Attaching and detaching policies for account '${accountId}' of organizational unit with path '${planned.path}' failed, cancel the remaining organizational units`,
      )
      return [
        ...results,
        {
          id: planned.id!,
          name: planned.newName!,
          success: false,
          status: CommandStatus.FAILED,
          message: "Accounts failed",
        },
        ...flatten(planned.children.map(cancelOrganizationalUnits)),
      ]
    }
  }

  results.push({
    id: planned.id!,
    name: planned.currentName!,
    message: "Updated",
    success: true,
    status: CommandStatus.SUCCESS,
  })

  for (const child of planned.children) {
    const childResults = await addOrUpdateOrganizationalUnits(
      logger,
      client,
      enabledPolicyTypes,
      serviceControlPoliciesJustEnabled,
      currentServiceControlPolicies,
      currentTagPolicies,
      currentAiServicesOptOutPolicies,
      currentAccounts,
      child,
      planned.id,
    )

    childResults.forEach((c) => results.push(c))
  }

  return results
}

const skipOrganizationalUnit = async (
  logger: Logger,
  client: OrganizationsClient,
  enabledPolicyTypes: PolicyType[],
  serviceControlPoliciesJustEnabled: boolean,
  currentServiceControlPolicies: Map<PolicyName, PolicyId>,
  currentTagPolicies: Map<PolicyName, PolicyId>,
  currentAiServicesOptOutPolicies: Map<PolicyName, PolicyId>,
  currentAccounts: Map<AccountId, OrganizationalUnitId>,
  planned: PlannedOrganizationalUnit,
): Promise<OrganizationalUnitDeploymentResult[]> => {
  const results = new Array<OrganizationalUnitDeploymentResult>()

  logger.info(`Skip organizational unit: ${planned.path}`)

  results.push({
    id: planned.id!,
    name: planned.currentName!,
    message: "No changes",
    success: true,
    status: CommandStatus.SKIPPED,
  })

  for (const child of planned.children) {
    const childResults = await addOrUpdateOrganizationalUnits(
      logger,
      client,
      enabledPolicyTypes,
      serviceControlPoliciesJustEnabled,
      currentServiceControlPolicies,
      currentTagPolicies,
      currentAiServicesOptOutPolicies,
      currentAccounts,
      child,
      planned.id!,
    )
    childResults.forEach((c) => results.push(c))
  }

  return results
}

export const deployOrganizationalUnits = async (
  holder: PoliciesDeploymentResultHolder,
): Promise<DeployOrganizationOutput> => {
  const {
    ctx,
    watch,
    io,
    result,
    organizationData: {
      currentRootOrganizationalUnit,
      currentTagPolicies,
      currentServiceControlPolicies,
      currentAiServicesOptOutPolicies,
    },
    plan: { organizationalUnitsPlan, organizationBasicConfigPlan },
  } = holder
  const childWatch = watch.startChild("deploy-organizational-units")

  if (result) {
    io.debug("Deploy already completed, cancel organizational units deployment")
    childWatch.stop()
    return cleanOrganizationalUnits({
      ...holder,
      organizationalUnitsDeploymentResult: {
        ...result,
        results: [],
      },
    })
  }

  if (!organizationalUnitsPlan.hasChanges) {
    io.info("No changes to organizational units")
    childWatch.stop()
    return cleanOrganizationalUnits({
      ...holder,
      organizationalUnitsDeploymentResult: {
        message: "Skipped",
        status: CommandStatus.SKIPPED,
        success: true,
        results: [],
      },
    })
  }

  io.info("Deploy organizational units")

  const enabledPolicyTypes = [
    ...organizationBasicConfigPlan.enabledPolicies.add,
    ...organizationBasicConfigPlan.enabledPolicies.retain,
  ]

  const serviceControlPoliciesMap = new Map(
    currentServiceControlPolicies.map((p) => [
      p.PolicySummary!.Name!,
      p.PolicySummary!.Id!,
    ]),
  )

  const tagPoliciesMap = new Map(
    currentTagPolicies.map((p) => [
      p.PolicySummary!.Name!,
      p.PolicySummary!.Id!,
    ]),
  )

  const aiServicesOptOutPoliciesMap = new Map(
    currentAiServicesOptOutPolicies.map((p) => [
      p.PolicySummary!.Name!,
      p.PolicySummary!.Id!,
    ]),
  )

  const currentOus = flatten(
    collectFromHierarchy(currentRootOrganizationalUnit, (o) => o.children),
  )

  const accountsMap = new Map(
    flatten(currentOus.map((o) => o.accounts.map((a) => [a.Id!, o.ou.Id!]))),
  )

  const serviceControlPoliciesJustEnabled = organizationBasicConfigPlan.enabledPolicies.add.includes(
    Constants.SERVICE_CONTROL_POLICY_TYPE,
  )

  const results = await addOrUpdateOrganizationalUnits(
    io,
    ctx.getClient(),
    enabledPolicyTypes,
    serviceControlPoliciesJustEnabled,
    serviceControlPoliciesMap,
    tagPoliciesMap,
    aiServicesOptOutPoliciesMap,
    accountsMap,
    organizationalUnitsPlan.root,
    null,
  )

  io.debugObject("Organizational units deployment results:", results)

  childWatch.stop()

  const newResult = resolveCommandOutputBase(results)

  return cleanOrganizationalUnits({
    ...holder,
    result: newResult.success ? null : newResult,
    organizationalUnitsDeploymentResult: {
      ...newResult,
      results,
    },
  })
}
