import { Constants } from "@takomo/core"
import { OrgEntityPoliciesConfig } from "@takomo/organization-config"
import { OrganizationState } from "@takomo/organization-context"
import { OrgEntityId } from "@takomo/organization-context/src/model"
import { Logger } from "@takomo/util"
import { PolicyName, PolicyType } from "aws-sdk/clients/organizations"
import intersection from "lodash.intersection"
import uniq from "lodash.uniq"
import without from "lodash.without"
import {
  EnabledPoliciesPlan,
  OrgEntityPoliciesPlan,
  OrgEntityPolicyOperations,
} from "./model"

export const getPoliciesToRemove = (
  currentPolicies: PolicyName[],
  plannedPolicies: PolicyName[],
): PolicyName[] => without(currentPolicies, ...plannedPolicies)

export const getPoliciesToAdd = (
  currentPolicies: PolicyName[],
  plannedPolicies: PolicyName[],
): PolicyName[] => without(plannedPolicies, ...currentPolicies)

export const getPoliciesToRetain = (
  currentPolicies: PolicyName[],
  plannedPolicies: PolicyName[],
): PolicyName[] => intersection(currentPolicies, plannedPolicies)

const createOrgEntityPolicyOperations = (
  current: PolicyName[],
  local: PolicyName[],
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

const policyTypes = [
  Constants.SERVICE_CONTROL_POLICY_TYPE,
  Constants.TAG_POLICY_TYPE,
  Constants.AISERVICES_OPT_OUT_POLICY_TYPE,
  Constants.BACKUP_POLICY_TYPE,
]

export const createOrgEntityPoliciesPlanForExistingEntity = (
  logger: Logger,
  id: OrgEntityId,
  localPolicies: OrgEntityPoliciesConfig,
  organizationState: OrganizationState,
  enabledPoliciesPlan: EnabledPoliciesPlan,
): OrgEntityPoliciesPlan => {
  const { serviceControl, aiServicesOptOut, backup, tag } = localPolicies

  const isPolicyTypeEnabled = (policyType: PolicyType): boolean =>
    enabledPoliciesPlan.add.includes(policyType) ||
    enabledPoliciesPlan.retain.includes(policyType)

  const getAttachedPolicies = (type: PolicyType) =>
    organizationState.getPoliciesAttachedToTarget(type, id)

  const [
    currentAttachedServiceControlPolicyNames,
    currentAttachedTagPolicyNames,
    currentAttachedAiServicesOptOutPolicyNames,
    currentAttachedBackupPolicyNames,
  ] = policyTypes.map(getAttachedPolicies)

  const attachedServiceControlPolicies = createOrgEntityPolicyOperations(
    currentAttachedServiceControlPolicyNames,
    uniq([...serviceControl.attached, ...serviceControl.inherited]),
    isPolicyTypeEnabled(Constants.SERVICE_CONTROL_POLICY_TYPE),
  )

  const attachedTagPolicies = createOrgEntityPolicyOperations(
    currentAttachedTagPolicyNames,
    tag.attached,
    isPolicyTypeEnabled(Constants.TAG_POLICY_TYPE),
  )

  const attachedAiServicesOptOutPolicies = createOrgEntityPolicyOperations(
    currentAttachedAiServicesOptOutPolicyNames,
    aiServicesOptOut.attached,
    isPolicyTypeEnabled(Constants.AISERVICES_OPT_OUT_POLICY_TYPE),
  )

  const attachedBackupPolicies = createOrgEntityPolicyOperations(
    currentAttachedBackupPolicyNames,
    backup.attached,
    isPolicyTypeEnabled(Constants.BACKUP_POLICY_TYPE),
  )

  const getInheritedPolicies = (type: PolicyType) =>
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
    isPolicyTypeEnabled(Constants.SERVICE_CONTROL_POLICY_TYPE),
  )

  const inheritedTagPolicies = createOrgEntityPolicyOperations(
    currentInheritedTagPolicyNames,
    tag.inherited,
    isPolicyTypeEnabled(Constants.TAG_POLICY_TYPE),
  )

  const inheritedAiServicesOptOutPolicies = createOrgEntityPolicyOperations(
    currentInheritedAiServicesOptOutPolicyNames,
    aiServicesOptOut.inherited,
    isPolicyTypeEnabled(Constants.AISERVICES_OPT_OUT_POLICY_TYPE),
  )

  const inheritedBackupPolicies = createOrgEntityPolicyOperations(
    currentInheritedBackupPolicyNames,
    backup.inherited,
    isPolicyTypeEnabled(Constants.BACKUP_POLICY_TYPE),
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
  logger: Logger,
  localPolicies: OrgEntityPoliciesConfig,
  enabledPoliciesPlan: EnabledPoliciesPlan,
): OrgEntityPoliciesPlan => {
  const { serviceControl, aiServicesOptOut, backup, tag } = localPolicies

  const isPolicyTypeEnabled = (policyType: PolicyType): boolean =>
    enabledPoliciesPlan.add.includes(policyType) ||
    enabledPoliciesPlan.retain.includes(policyType)

  const attachedServiceControlPolicies = createOrgEntityPolicyOperations(
    [],
    uniq([...serviceControl.attached, ...serviceControl.inherited]),
    isPolicyTypeEnabled(Constants.SERVICE_CONTROL_POLICY_TYPE),
  )

  const attachedTagPolicies = createOrgEntityPolicyOperations(
    [],
    tag.attached,
    isPolicyTypeEnabled(Constants.TAG_POLICY_TYPE),
  )

  const attachedAiServicesOptOutPolicies = createOrgEntityPolicyOperations(
    [],
    aiServicesOptOut.attached,
    isPolicyTypeEnabled(Constants.AISERVICES_OPT_OUT_POLICY_TYPE),
  )

  const attachedBackupPolicies = createOrgEntityPolicyOperations(
    [],
    backup.attached,
    isPolicyTypeEnabled(Constants.BACKUP_POLICY_TYPE),
  )

  const inheritedServiceControlPolicies = createOrgEntityPolicyOperations(
    [],
    serviceControl.inherited,
    isPolicyTypeEnabled(Constants.SERVICE_CONTROL_POLICY_TYPE),
  )

  const inheritedTagPolicies = createOrgEntityPolicyOperations(
    [],
    tag.inherited,
    isPolicyTypeEnabled(Constants.TAG_POLICY_TYPE),
  )

  const inheritedAiServicesOptOutPolicies = createOrgEntityPolicyOperations(
    [],
    aiServicesOptOut.inherited,
    isPolicyTypeEnabled(Constants.AISERVICES_OPT_OUT_POLICY_TYPE),
  )

  const inheritedBackupPolicies = createOrgEntityPolicyOperations(
    [],
    backup.inherited,
    isPolicyTypeEnabled(Constants.BACKUP_POLICY_TYPE),
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
  logger: Logger,
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
