import { OrganizationsClient } from "@takomo/aws-clients"
import { CommandStatus, Constants } from "@takomo/core"
import { OrganizationState } from "@takomo/organization-context"
import { Logger } from "@takomo/util"
import { OrganizationalUnitId, PolicyType } from "aws-sdk/clients/organizations"
import flatten from "lodash.flatten"
import { OrganizationalUnitDeploymentResult } from "../model"
import { OrgEntityPoliciesPlan, PlannedOrganizationalUnit } from "../plan/model"
import { addOrUpdateOrganizationalUnits } from "./add-or-update-organizational-units"
import { attachAndDetachPolicies } from "./attach-and-detach-policies"
import { cancelOrganizationalUnits } from "./cancel-organizational-units"

const createOrganizationalUnit = async (
  logger: Logger,
  client: OrganizationsClient,
  planned: PlannedOrganizationalUnit,
  parentId: OrganizationalUnitId,
): Promise<OrganizationalUnitDeploymentResult> =>
  client
    .createOrganizationalUnit({
      Name: planned.name,
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
        name: planned.name,
        message: e.message,
        success: false,
        status: CommandStatus.FAILED,
      }
    })

export const addOrganizationalUnit = async (
  logger: Logger,
  client: OrganizationsClient,
  enabledPolicyTypes: PolicyType[],
  serviceControlPoliciesJustEnabled: boolean,
  organizationState: OrganizationState,
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
  const initialBackupPolicies = initialPolicies.filter(
    (p) => p.Type === Constants.BACKUP_POLICY_TYPE,
  )
  const initialBackupPolicyNames = initialBackupPolicies.map((p) => p.Name!)
  const serviceControlPoliciesToAttach = planned.policies.serviceControl.attached.add.filter(
    (p) => !initialServiceControlPolicyNames.includes(p),
  )
  const serviceControlPoliciesToDetach = initialServiceControlPolicyNames.filter(
    (p) => !planned.policies.serviceControl.attached.add.includes(p),
  )
  const tagPoliciesToAttach = planned.policies.tag.attached.add.filter(
    (p) => !initialTagPolicyNames.includes(p),
  )
  const tagPoliciesToDetach = initialTagPolicyNames.filter(
    (p) => !planned.policies.tag.attached.add.includes(p),
  )
  const aiServicesOptOutPoliciesToAttach = planned.policies.aiServicesOptOut.attached.add.filter(
    (p) => !initialAiServicesOptOutPolicyNames.includes(p),
  )
  const aiServicesOptOutPoliciesToDetach = initialAiServicesOptOutPolicyNames.filter(
    (p) => !planned.policies.aiServicesOptOut.attached.add.includes(p),
  )
  const backupPoliciesToAttach = planned.policies.backup.attached.add.filter(
    (p) => !initialAiServicesOptOutPolicyNames.includes(p),
  )
  const backupPoliciesToDetach = initialBackupPolicyNames.filter(
    (p) => !planned.policies.backup.attached.add.includes(p),
  )

  const plan: OrgEntityPoliciesPlan = {
    hasChanges: true,
    serviceControl: {
      inherited: {
        add: [],
        remove: [],
        retain: [],
      },
      attached: {
        add: serviceControlPoliciesToAttach,
        remove: serviceControlPoliciesToDetach,
        retain: [],
      },
    },
    tag: {
      inherited: {
        add: [],
        remove: [],
        retain: [],
      },
      attached: {
        add: tagPoliciesToAttach,
        remove: tagPoliciesToDetach,
        retain: [],
      },
    },
    backup: {
      inherited: {
        add: [],
        remove: [],
        retain: [],
      },
      attached: {
        add: backupPoliciesToAttach,
        remove: backupPoliciesToDetach,
        retain: [],
      },
    },
    aiServicesOptOut: {
      inherited: {
        add: [],
        remove: [],
        retain: [],
      },
      attached: {
        add: aiServicesOptOutPoliciesToAttach,
        remove: aiServicesOptOutPoliciesToDetach,
        retain: [],
      },
    },
  }

  if (
    !(await attachAndDetachPolicies(
      logger,
      client,
      enabledPolicyTypes,
      serviceControlPoliciesJustEnabled,
      organizationState,
      "organizational unit",
      addedOu.id!,
      plan,
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
    const currentOu = organizationState.getParentOrganizationalUnit(accountId)
    const newOu = addedOu.id!
    logger.info(
      `Move account '${accountId}' from organizational unit ${currentOu} to ${newOu}`,
    )

    if (
      !(await client.moveAccount({
        AccountId: accountId,
        DestinationParentId: newOu,
        SourceParentId: currentOu.Id!,
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
        organizationState,
        "account",
        accountId,
        account.policies,
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
      organizationState,
      child,
      addedOu.id,
    )
    childResults.forEach((c) => results.push(c))
  }

  return results
}
