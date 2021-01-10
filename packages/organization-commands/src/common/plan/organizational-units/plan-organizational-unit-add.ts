import { OrganizationalUnitId } from "@takomo/aws-model"
import { OrganizationalUnitConfig } from "@takomo/organization-config"
import { OrganizationState } from "@takomo/organization-context"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { TkmLogger } from "@takomo/util"
import { EnabledPoliciesPlan } from "../basic-config/model"
import { createOrgEntityPoliciesPlan } from "./create-org-entity-policies-plan"
import { createOrganizationalUnitsDeploymentPlan } from "./create-organizational-units-deployment-plan"
import { PlannedOrganizationalUnit } from "./model"
import { planAccountUpdate } from "./plan-account-update"

export const planOrganizationalUnitAdd = (
  logger: TkmLogger,
  enabledPoliciesPlan: EnabledPoliciesPlan,
  ouPath: OrganizationalUnitPath,
  localOu: OrganizationalUnitConfig,
  organizationState: OrganizationState,
  parentId: OrganizationalUnitId | null,
): PlannedOrganizationalUnit => {
  logger.debug(`Plan add for OU with path: '${ouPath}'`)

  const children = localOu.children
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map((localChild) =>
      createOrganizationalUnitsDeploymentPlan(
        logger,
        enabledPoliciesPlan,
        localChild.path,
        localChild,
        null,
        organizationState,
        null,
      ),
    )

  const policies = createOrgEntityPoliciesPlan(
    logger,
    null,
    localOu.policies,
    organizationState,
    enabledPoliciesPlan,
  )

  return {
    children,
    parentId,
    policies,
    path: ouPath,
    priority: localOu.priority,
    id: null,
    name: localOu.name,
    operation: "add",
    accounts: {
      add: localOu.accounts.map((account) =>
        planAccountUpdate(
          logger,
          organizationState.getAccount(account.id),
          account,
          organizationState,
          enabledPoliciesPlan,
        ),
      ),
      retain: [],
      remove: [],
    },
  }
}
