import { OrganizationPoliciesConfig } from "@takomo/organization-config"
import {
  OrganizationConfigRepository,
  OrganizationState,
} from "@takomo/organization-context"
import { PolicyDeploymentPlan, PolicyOperations } from "./model"
import { planPoliciesByType } from "./plan-policies-by-type"

const operationsHasChanges = ({
  remove,
  update,
  add,
}: PolicyOperations): boolean => remove.length + update.length + add.length > 0

export const createPoliciesDeploymentPlan = async (
  configRepository: OrganizationConfigRepository,
  organizationState: OrganizationState,
  localServiceControlPoliciesConfig: OrganizationPoliciesConfig,
  localTagPoliciesConfig: OrganizationPoliciesConfig,
  localAiServicesOptOutConfig: OrganizationPoliciesConfig,
  localBackupConfig: OrganizationPoliciesConfig,
): Promise<PolicyDeploymentPlan> => {
  const [serviceControl, tag, aiServicesOptOut, backup] = await Promise.all([
    planPoliciesByType(
      "SERVICE_CONTROL_POLICY",
      localServiceControlPoliciesConfig.policies,
      organizationState,
      configRepository,
    ),
    planPoliciesByType(
      "TAG_POLICY",
      localTagPoliciesConfig.policies,
      organizationState,
      configRepository,
    ),
    planPoliciesByType(
      "AISERVICES_OPT_OUT_POLICY",
      localAiServicesOptOutConfig.policies,
      organizationState,
      configRepository,
    ),
    planPoliciesByType(
      "BACKUP_POLICY",
      localBackupConfig.policies,
      organizationState,
      configRepository,
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
