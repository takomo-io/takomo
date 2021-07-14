import { OrganizationsClient } from "@takomo/aws-clients"
import { OrganizationalUnitId, OrganizationPolicyType } from "@takomo/aws-model"
import { OrganizationState } from "@takomo/organization-context"
import { TkmLogger } from "@takomo/util"
import {
  OrgEntityPoliciesPlan,
  PlannedOrganizationalUnit,
} from "../../common/plan/organizational-units/model"
import { OrganizationalUnitDeploymentResult } from "../model"
import { addOrUpdateOrganizationalUnits } from "./add-or-update-organizational-units"
import { attachAndDetachPolicies } from "./attach-and-detach-policies"
import { cancelOrganizationalUnits } from "./cancel-organizational-units"

const createOrganizationalUnit = async (
  logger: TkmLogger,
  client: OrganizationsClient,
  planned: PlannedOrganizationalUnit,
  parentId: OrganizationalUnitId,
): Promise<OrganizationalUnitDeploymentResult> =>
  client
    .createOrganizationalUnit({
      Name: planned.name,
      ParentId: parentId!,
    })
    .then(
      (res) =>
        ({
          id: res.id,
          name: res.name,
          message: "Added",
          success: true,
          status: "SUCCESS",
        } as OrganizationalUnitDeploymentResult),
    )
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
        status: "FAILED",
      } as OrganizationalUnitDeploymentResult
    })

export const addOrganizationalUnit = async (
  logger: TkmLogger,
  client: OrganizationsClient,
  enabledPolicyTypes: ReadonlyArray<OrganizationPolicyType>,
  serviceControlPoliciesJustEnabled: boolean,
  organizationState: OrganizationState,
  planned: PlannedOrganizationalUnit,
  parentId: OrganizationalUnitId,
): Promise<ReadonlyArray<OrganizationalUnitDeploymentResult>> => {
  const results = new Array<OrganizationalUnitDeploymentResult>()

  logger.info(`Create new organizational unit with path '${planned.path}'`)

  const addedOu: OrganizationalUnitDeploymentResult =
    await createOrganizationalUnit(logger, client, planned, parentId)

  if (!addedOu.success) {
    logger.warn(
      `Creating of new organizational unit with path '${planned.path}' failed, cancel the remaining organizational units`,
    )
    return [
      ...results,
      addedOu,
      ...planned.children.map(cancelOrganizationalUnits).flat(),
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
    (p) => p.type === "SERVICE_CONTROL_POLICY",
  )
  const initialServiceControlPolicyNames = initialServiceControlPolicies.map(
    (p) => p.name,
  )
  const initialTagPolicies = initialPolicies.filter(
    (p) => p.type === "TAG_POLICY",
  )
  const initialTagPolicyNames = initialTagPolicies.map((p) => p.name)
  const initialAiServicesOptOutPolicies = initialPolicies.filter(
    (p) => p.type === "AISERVICES_OPT_OUT_POLICY",
  )
  const initialAiServicesOptOutPolicyNames =
    initialAiServicesOptOutPolicies.map((p) => p.name)
  const initialBackupPolicies = initialPolicies.filter(
    (p) => p.type === "BACKUP_POLICY",
  )
  const initialBackupPolicyNames = initialBackupPolicies.map((p) => p.name)
  const serviceControlPoliciesToAttach =
    planned.policies.serviceControl.attached.add.filter(
      (p) => !initialServiceControlPolicyNames.includes(p),
    )
  const serviceControlPoliciesToDetach =
    initialServiceControlPolicyNames.filter(
      (p) => !planned.policies.serviceControl.attached.add.includes(p),
    )
  const tagPoliciesToAttach = planned.policies.tag.attached.add.filter(
    (p) => !initialTagPolicyNames.includes(p),
  )
  const tagPoliciesToDetach = initialTagPolicyNames.filter(
    (p) => !planned.policies.tag.attached.add.includes(p),
  )
  const aiServicesOptOutPoliciesToAttach =
    planned.policies.aiServicesOptOut.attached.add.filter(
      (p) => !initialAiServicesOptOutPolicyNames.includes(p),
    )
  const aiServicesOptOutPoliciesToDetach =
    initialAiServicesOptOutPolicyNames.filter(
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
        status: "FAILED",
        message: "Policies failed",
      },
      ...planned.children.map(cancelOrganizationalUnits).flat(),
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
        SourceParentId: currentOu.id,
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
          status: "FAILED",
          message: "Accounts failed",
        },
        ...planned.children.map(cancelOrganizationalUnits).flat(),
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
          status: "FAILED",
          message: "Accounts failed",
        },
        ...planned.children.map(cancelOrganizationalUnits).flat(),
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
