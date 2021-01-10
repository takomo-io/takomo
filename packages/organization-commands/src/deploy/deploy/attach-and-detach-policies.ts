import { OrganizationsClient } from "@takomo/aws-clients"
import {
  OrganizationPolicyName,
  OrganizationPolicyType,
} from "@takomo/aws-model"
import { OrganizationState, OrgEntityId } from "@takomo/organization-context"
import { DEFAULT_SERVICE_CONTROL_POLICY_NAME } from "@takomo/organization-model"
import { TkmLogger } from "@takomo/util"
import { OrgEntityPoliciesPlan } from "../../common/plan/organizational-units/model"

const attachPolicies = async (
  logger: TkmLogger,
  policyType: OrganizationPolicyType,
  client: OrganizationsClient,
  targetType: string,
  targetId: OrgEntityId,
  policiesToAttach: ReadonlyArray<string>,
  organizationState: OrganizationState,
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
    const policyId = organizationState.getPolicyId(policyType, policyName)
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

const detachPolicies = async (
  logger: TkmLogger,
  policyType: OrganizationPolicyType,
  client: OrganizationsClient,
  targetType: "account" | "organizational unit",
  targetId: OrgEntityId,
  policiesToDetach: ReadonlyArray<OrganizationPolicyName>,
  organizationState: OrganizationState,
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
    const policyId = organizationState.getPolicyId(policyType, policyName)
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

export const attachAndDetachPolicies = async (
  logger: TkmLogger,
  client: OrganizationsClient,
  enabledPolicyTypes: ReadonlyArray<OrganizationPolicyType>,
  serviceControlPoliciesJustEnabled: boolean,
  organizationState: OrganizationState,
  targetType: "organizational unit" | "account",
  targetId: OrgEntityId,
  plan: OrgEntityPoliciesPlan,
): Promise<boolean> => {
  if (enabledPolicyTypes.includes("SERVICE_CONTROL_POLICY")) {
    // If service control policies were just enabled in organization,
    // then the default policy was attached to every OU and account,
    // and therefore it can't be attached again here
    const policiesToAttach = serviceControlPoliciesJustEnabled
      ? plan.serviceControl.attached.add.filter(
          (p) => p !== DEFAULT_SERVICE_CONTROL_POLICY_NAME,
        )
      : plan.serviceControl.attached.add

    if (
      !(await attachPolicies(
        logger,
        "SERVICE_CONTROL_POLICY",
        client,
        targetType,
        targetId,
        policiesToAttach,
        organizationState,
      ))
    ) {
      return false
    }
  }

  if (enabledPolicyTypes.includes("TAG_POLICY")) {
    if (
      !(await attachPolicies(
        logger,
        "TAG_POLICY",
        client,
        targetType,
        targetId,
        plan.tag.attached.add,
        organizationState,
      ))
    ) {
      return false
    }
  }

  if (enabledPolicyTypes.includes("AISERVICES_OPT_OUT_POLICY")) {
    if (
      !(await attachPolicies(
        logger,
        "AISERVICES_OPT_OUT_POLICY",
        client,
        targetType,
        targetId,
        plan.aiServicesOptOut.attached.add,
        organizationState,
      ))
    ) {
      return false
    }
  }

  if (enabledPolicyTypes.includes("BACKUP_POLICY")) {
    if (
      !(await attachPolicies(
        logger,
        "BACKUP_POLICY",
        client,
        targetType,
        targetId,
        plan.backup.attached.add,
        organizationState,
      ))
    ) {
      return false
    }
  }

  if (enabledPolicyTypes.includes("SERVICE_CONTROL_POLICY")) {
    if (
      !(await detachPolicies(
        logger,
        "SERVICE_CONTROL_POLICY",
        client,
        targetType,
        targetId,
        plan.serviceControl.attached.remove,
        organizationState,
      ))
    ) {
      return false
    }
  }

  if (enabledPolicyTypes.includes("TAG_POLICY")) {
    if (
      !(await detachPolicies(
        logger,
        "TAG_POLICY",
        client,
        targetType,
        targetId,
        plan.tag.attached.remove,
        organizationState,
      ))
    ) {
      return false
    }
  }

  if (enabledPolicyTypes.includes("AISERVICES_OPT_OUT_POLICY")) {
    if (
      !(await detachPolicies(
        logger,
        "AISERVICES_OPT_OUT_POLICY",
        client,
        targetType,
        targetId,
        plan.aiServicesOptOut.attached.remove,
        organizationState,
      ))
    ) {
      return false
    }
  }

  if (enabledPolicyTypes.includes("BACKUP_POLICY")) {
    if (
      !(await detachPolicies(
        logger,
        "BACKUP_POLICY",
        client,
        targetType,
        targetId,
        plan.backup.attached.remove,
        organizationState,
      ))
    ) {
      return false
    }
  }

  return true
}
