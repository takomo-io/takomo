import { OrganizationsClient } from "@takomo/aws-clients"
import { Constants } from "@takomo/core"
import { OrganizationState } from "@takomo/organization-context"
import { OrgEntityId } from "@takomo/organization-context/src/model"
import { Logger } from "@takomo/util"
import { PolicyName, PolicyType } from "aws-sdk/clients/organizations"
import { OrgEntityPoliciesPlan } from "../plan/model"

const attachPolicies = async (
  logger: Logger,
  policyType: PolicyType,
  client: OrganizationsClient,
  targetType: string,
  targetId: OrgEntityId,
  policiesToAttach: string[],
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
  logger: Logger,
  policyType: PolicyType,
  client: OrganizationsClient,
  targetType: "account" | "organizational unit",
  targetId: OrgEntityId,
  policiesToDetach: PolicyName[],
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
  logger: Logger,
  client: OrganizationsClient,
  enabledPolicyTypes: PolicyType[],
  serviceControlPoliciesJustEnabled: boolean,
  organizationState: OrganizationState,
  targetType: "organizational unit" | "account",
  targetId: OrgEntityId,
  plan: OrgEntityPoliciesPlan,
): Promise<boolean> => {
  if (enabledPolicyTypes.includes(Constants.SERVICE_CONTROL_POLICY_TYPE)) {
    // If service control policies were just enabled in organization,
    // then the default policy was attached to every OU and account,
    // and therefore it can't be attached again here
    const policiesToAttach = serviceControlPoliciesJustEnabled
      ? plan.serviceControl.attached.add.filter(
          (p) => p !== Constants.DEFAULT_SERVICE_CONTROL_POLICY_NAME,
        )
      : plan.serviceControl.attached.add

    if (
      !(await attachPolicies(
        logger,
        Constants.SERVICE_CONTROL_POLICY_TYPE,
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

  if (enabledPolicyTypes.includes(Constants.TAG_POLICY_TYPE)) {
    if (
      !(await attachPolicies(
        logger,
        Constants.TAG_POLICY_TYPE,
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

  if (enabledPolicyTypes.includes(Constants.AISERVICES_OPT_OUT_POLICY_TYPE)) {
    if (
      !(await attachPolicies(
        logger,
        Constants.AISERVICES_OPT_OUT_POLICY_TYPE,
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

  if (enabledPolicyTypes.includes(Constants.BACKUP_POLICY_TYPE)) {
    if (
      !(await attachPolicies(
        logger,
        Constants.BACKUP_POLICY_TYPE,
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

  if (enabledPolicyTypes.includes(Constants.SERVICE_CONTROL_POLICY_TYPE)) {
    if (
      !(await detachPolicies(
        logger,
        Constants.SERVICE_CONTROL_POLICY_TYPE,
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

  if (enabledPolicyTypes.includes(Constants.TAG_POLICY_TYPE)) {
    if (
      !(await detachPolicies(
        logger,
        Constants.TAG_POLICY_TYPE,
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

  if (enabledPolicyTypes.includes(Constants.AISERVICES_OPT_OUT_POLICY_TYPE)) {
    if (
      !(await detachPolicies(
        logger,
        Constants.AISERVICES_OPT_OUT_POLICY_TYPE,
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

  if (enabledPolicyTypes.includes(Constants.BACKUP_POLICY_TYPE)) {
    if (
      !(await detachPolicies(
        logger,
        Constants.BACKUP_POLICY_TYPE,
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
