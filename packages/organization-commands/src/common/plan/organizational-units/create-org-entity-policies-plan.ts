import {
  OrganizationPolicyName,
  OrganizationPolicyType,
} from "@takomo/aws-model"
import { OrgEntityPoliciesConfig } from "@takomo/organization-config"
import { OrganizationState, OrgEntityId } from "@takomo/organization-context"
import { TkmLogger } from "@takomo/util"
import intersection from "lodash.intersection"
import without from "lodash.without"
import R from "ramda"
import { EnabledPoliciesPlan } from "../basic-config/model"
import { OrgEntityPoliciesPlan, OrgEntityPolicyOperations } from "./model"

export const getPoliciesToRemove = (
  currentPolicies: ReadonlyArray<OrganizationPolicyName>,
  plannedPolicies: ReadonlyArray<OrganizationPolicyName>,
): OrganizationPolicyName[] => without(currentPolicies, ...plannedPolicies)

export const getPoliciesToAdd = (
  currentPolicies: ReadonlyArray<OrganizationPolicyName>,
  plannedPolicies: ReadonlyArray<OrganizationPolicyName>,
): OrganizationPolicyName[] => without(plannedPolicies, ...currentPolicies)

export const getPoliciesToRetain = (
  currentPolicies: ReadonlyArray<OrganizationPolicyName>,
  plannedPolicies: ReadonlyArray<OrganizationPolicyName>,
): OrganizationPolicyName[] => intersection(currentPolicies, plannedPolicies)

const createOrgEntityPolicyOperations = (
  current: ReadonlyArray<OrganizationPolicyName>,
  local: ReadonlyArray<OrganizationPolicyName>,
  enabled: boolean,
): OrgEntityPolicyOperations =>
  enabled
    ? {
        add: getPoliciesToAdd(current, local),
        retain: getPoliciesToRetain(current, local),
        remove: getPoliciesToRemove(current, local),
      }
    : {
        add: [],
        retain: [],
        remove: current,
      }

const hasOperationChanges = (operations: OrgEntityPolicyOperations): boolean =>
  operations.remove.length > 0 || operations.add.length > 0

const policyTypes: Array<OrganizationPolicyType> = [
  "SERVICE_CONTROL_POLICY",
  "TAG_POLICY",
  "AISERVICES_OPT_OUT_POLICY",
  "BACKUP_POLICY",
]

export const createOrgEntityPoliciesPlanForExistingEntity = (
  logger: TkmLogger,
  id: OrgEntityId,
  localPolicies: OrgEntityPoliciesConfig,
  organizationState: OrganizationState,
  enabledPoliciesPlan: EnabledPoliciesPlan,
): OrgEntityPoliciesPlan => {
  const { serviceControl, aiServicesOptOut, backup, tag } = localPolicies

  const isPolicyTypeEnabled = (policyType: OrganizationPolicyType): boolean =>
    enabledPoliciesPlan.add.includes(policyType) ||
    enabledPoliciesPlan.retain.includes(policyType)

  const getAttachedPolicies = (type: OrganizationPolicyType) =>
    organizationState.getPoliciesAttachedToTarget(type, id)

  const [
    currentAttachedServiceControlPolicyNames,
    currentAttachedTagPolicyNames,
    currentAttachedAiServicesOptOutPolicyNames,
    currentAttachedBackupPolicyNames,
  ] = policyTypes.map(getAttachedPolicies)

  const attachedServiceControlPolicies = createOrgEntityPolicyOperations(
    currentAttachedServiceControlPolicyNames,
    R.uniq([...serviceControl.attached, ...serviceControl.inherited]),
    isPolicyTypeEnabled("SERVICE_CONTROL_POLICY"),
  )

  const attachedTagPolicies = createOrgEntityPolicyOperations(
    currentAttachedTagPolicyNames,
    tag.attached,
    isPolicyTypeEnabled("TAG_POLICY"),
  )

  const attachedAiServicesOptOutPolicies = createOrgEntityPolicyOperations(
    currentAttachedAiServicesOptOutPolicyNames,
    aiServicesOptOut.attached,
    isPolicyTypeEnabled("AISERVICES_OPT_OUT_POLICY"),
  )

  const attachedBackupPolicies = createOrgEntityPolicyOperations(
    currentAttachedBackupPolicyNames,
    backup.attached,
    isPolicyTypeEnabled("BACKUP_POLICY"),
  )

  const getInheritedPolicies = (type: OrganizationPolicyType) =>
    organizationState.getPoliciesInheritedByTarget(type, id)

  const [
    currentInheritedServiceControlPolicyNames,
    currentInheritedTagPolicyNames,
    currentInheritedAiServicesOptOutPolicyNames,
    currentInheritedBackupPolicyNames,
  ] = policyTypes.map(getInheritedPolicies)

  const inheritedServiceControlPolicies = createOrgEntityPolicyOperations(
    currentInheritedServiceControlPolicyNames,
    serviceControl.inherited,
    isPolicyTypeEnabled("SERVICE_CONTROL_POLICY"),
  )

  const inheritedTagPolicies = createOrgEntityPolicyOperations(
    currentInheritedTagPolicyNames,
    tag.inherited,
    isPolicyTypeEnabled("TAG_POLICY"),
  )

  const inheritedAiServicesOptOutPolicies = createOrgEntityPolicyOperations(
    currentInheritedAiServicesOptOutPolicyNames,
    aiServicesOptOut.inherited,
    isPolicyTypeEnabled("AISERVICES_OPT_OUT_POLICY"),
  )

  const inheritedBackupPolicies = createOrgEntityPolicyOperations(
    currentInheritedBackupPolicyNames,
    backup.inherited,
    isPolicyTypeEnabled("BACKUP_POLICY"),
  )

  const hasChanges = [
    inheritedServiceControlPolicies,
    attachedServiceControlPolicies,
    inheritedTagPolicies,
    attachedTagPolicies,
    inheritedBackupPolicies,
    attachedBackupPolicies,
    inheritedAiServicesOptOutPolicies,
    attachedAiServicesOptOutPolicies,
  ].some(hasOperationChanges)

  return {
    hasChanges,
    serviceControl: {
      inherited: inheritedServiceControlPolicies,
      attached: attachedServiceControlPolicies,
    },
    tag: {
      inherited: inheritedTagPolicies,
      attached: attachedTagPolicies,
    },
    aiServicesOptOut: {
      inherited: inheritedAiServicesOptOutPolicies,
      attached: attachedAiServicesOptOutPolicies,
    },
    backup: {
      inherited: inheritedBackupPolicies,
      attached: attachedBackupPolicies,
    },
  }
}

export const createOrgEntityPoliciesPlanForNewEntity = (
  logger: TkmLogger,
  localPolicies: OrgEntityPoliciesConfig,
  enabledPoliciesPlan: EnabledPoliciesPlan,
): OrgEntityPoliciesPlan => {
  const { serviceControl, aiServicesOptOut, backup, tag } = localPolicies

  const isPolicyTypeEnabled = (policyType: OrganizationPolicyType): boolean =>
    enabledPoliciesPlan.add.includes(policyType) ||
    enabledPoliciesPlan.retain.includes(policyType)

  const attachedServiceControlPolicies = createOrgEntityPolicyOperations(
    [],
    R.uniq([...serviceControl.attached, ...serviceControl.inherited]),
    isPolicyTypeEnabled("SERVICE_CONTROL_POLICY"),
  )

  const attachedTagPolicies = createOrgEntityPolicyOperations(
    [],
    tag.attached,
    isPolicyTypeEnabled("TAG_POLICY"),
  )

  const attachedAiServicesOptOutPolicies = createOrgEntityPolicyOperations(
    [],
    aiServicesOptOut.attached,
    isPolicyTypeEnabled("AISERVICES_OPT_OUT_POLICY"),
  )

  const attachedBackupPolicies = createOrgEntityPolicyOperations(
    [],
    backup.attached,
    isPolicyTypeEnabled("BACKUP_POLICY"),
  )

  const inheritedServiceControlPolicies = createOrgEntityPolicyOperations(
    [],
    serviceControl.inherited,
    isPolicyTypeEnabled("SERVICE_CONTROL_POLICY"),
  )

  const inheritedTagPolicies = createOrgEntityPolicyOperations(
    [],
    tag.inherited,
    isPolicyTypeEnabled("TAG_POLICY"),
  )

  const inheritedAiServicesOptOutPolicies = createOrgEntityPolicyOperations(
    [],
    aiServicesOptOut.inherited,
    isPolicyTypeEnabled("AISERVICES_OPT_OUT_POLICY"),
  )

  const inheritedBackupPolicies = createOrgEntityPolicyOperations(
    [],
    backup.inherited,
    isPolicyTypeEnabled("BACKUP_POLICY"),
  )

  const hasChanges = [
    inheritedServiceControlPolicies,
    attachedServiceControlPolicies,
    inheritedTagPolicies,
    attachedTagPolicies,
    inheritedBackupPolicies,
    attachedBackupPolicies,
    inheritedAiServicesOptOutPolicies,
    attachedAiServicesOptOutPolicies,
  ].some(hasOperationChanges)

  return {
    hasChanges,
    serviceControl: {
      inherited: inheritedServiceControlPolicies,
      attached: attachedServiceControlPolicies,
    },
    tag: {
      inherited: inheritedTagPolicies,
      attached: attachedTagPolicies,
    },
    aiServicesOptOut: {
      inherited: inheritedAiServicesOptOutPolicies,
      attached: attachedAiServicesOptOutPolicies,
    },
    backup: {
      inherited: inheritedBackupPolicies,
      attached: attachedBackupPolicies,
    },
  }
}

export const createOrgEntityPoliciesPlan = (
  logger: TkmLogger,
  id: OrgEntityId | null,
  localPolicies: OrgEntityPoliciesConfig,
  organizationState: OrganizationState,
  enabledPoliciesPlan: EnabledPoliciesPlan,
): OrgEntityPoliciesPlan =>
  id
    ? createOrgEntityPoliciesPlanForExistingEntity(
        logger,
        id,
        localPolicies,
        organizationState,
        enabledPoliciesPlan,
      )
    : createOrgEntityPoliciesPlanForNewEntity(
        logger,
        localPolicies,
        enabledPoliciesPlan,
      )
