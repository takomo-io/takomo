import { Constants } from "@takomo/core"
import { OrganizationPoliciesConfig } from "@takomo/organization-config"
import { OrganizationState } from "@takomo/organization-context"
import path from "path"
import { PolicyDeploymentPlan, PolicyOperations } from "./model"
import { planPoliciesByType } from "./plan-policies-by-type"

const operationsHasChanges = ({
  remove,
  update,
  add,
}: PolicyOperations): boolean => remove.length + update.length + add.length > 0

export const createPoliciesDeploymentPlan = async (
  organizationDir: string,
  organizationState: OrganizationState,
  localServiceControlPoliciesConfig: OrganizationPoliciesConfig,
  localTagPoliciesConfig: OrganizationPoliciesConfig,
  localAiServicesOptOutConfig: OrganizationPoliciesConfig,
  localBackupConfig: OrganizationPoliciesConfig,
): Promise<PolicyDeploymentPlan> => {
  const [serviceControl, tag, aiServicesOptOut, backup] = await Promise.all([
    planPoliciesByType(
      Constants.SERVICE_CONTROL_POLICY_TYPE,
      localServiceControlPoliciesConfig.policies,
      organizationState,
      path.join(organizationDir, "service-control-policies"),
    ),
    planPoliciesByType(
      Constants.TAG_POLICY_TYPE,
      localTagPoliciesConfig.policies,
      organizationState,
      path.join(organizationDir, "tag-policies"),
    ),
    planPoliciesByType(
      Constants.AISERVICES_OPT_OUT_POLICY_TYPE,
      localAiServicesOptOutConfig.policies,
      organizationState,
      path.join(organizationDir, "ai-services-opt-out-policies"),
    ),
    planPoliciesByType(
      Constants.BACKUP_POLICY_TYPE,
      localBackupConfig.policies,
      organizationState,
      path.join(organizationDir, "backup-policies"),
    ),
  ])

  const hasChanges = [serviceControl, tag, aiServicesOptOut, backup].some(
    operationsHasChanges,
  )

  return {
    skip: false,
    hasChanges,
    serviceControl,
    tag,
    aiServicesOptOut,
    backup,
  }
}
