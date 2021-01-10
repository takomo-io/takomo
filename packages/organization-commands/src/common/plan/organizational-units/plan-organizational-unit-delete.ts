import { DetailedOrganizationalUnit } from "@takomo/aws-model"
import { OrganizationState } from "@takomo/organization-context"
import { TkmLogger } from "@takomo/util"
import { EnabledPoliciesPlan } from "../basic-config/model"
import { createOrgEntityPoliciesPlan } from "./create-org-entity-policies-plan"
import { createOrganizationalUnitsDeploymentPlan } from "./create-organizational-units-deployment-plan"
import { PlannedOrganizationalUnit } from "./model"

export const planOrganizationalUnitDelete = (
  logger: TkmLogger,
  enabledPoliciesPlan: EnabledPoliciesPlan,
  ouPath: string,
  currentOu: DetailedOrganizationalUnit,
  organizationState: OrganizationState,
  parentId: string | null,
): PlannedOrganizationalUnit => {
  logger.debug(
    `Plan delete for OU with path: '${ouPath}', id: ${currentOu.ou.id}`,
  )

  const policies = createOrgEntityPoliciesPlan(
    logger,
    currentOu.ou.id,
    {
      serviceControl: {
        attached: [],
        inherited: [],
      },
      tag: {
        attached: [],
        inherited: [],
      },
      backup: {
        attached: [],
        inherited: [],
      },
      aiServicesOptOut: {
        attached: [],
        inherited: [],
      },
    },
    organizationState,
    enabledPoliciesPlan,
  )

  const children = currentOu.children.map((child) =>
    createOrganizationalUnitsDeploymentPlan(
      logger,
      enabledPoliciesPlan,
      `${ouPath}/${child.ou.name}`,
      null,
      child,
      organizationState,
      currentOu.ou.id,
    ),
  )

  return {
    children,
    parentId,
    policies,
    path: ouPath,
    priority: 0,
    id: currentOu.ou.id,
    name: currentOu.ou.name,
    operation: "delete",
    accounts: {
      add: [],
      retain: [],
      remove: currentOu.accounts.map((a) => ({
        id: a.id,
        operation: "delete",
        policies: createOrgEntityPoliciesPlan(
          logger,
          a.id,
          {
            serviceControl: {
              attached: [],
              inherited: [],
            },
            tag: {
              attached: [],
              inherited: [],
            },
            backup: {
              attached: [],
              inherited: [],
            },
            aiServicesOptOut: {
              attached: [],
              inherited: [],
            },
          },
          organizationState,
          enabledPoliciesPlan,
        ),
      })),
    },
  }
}
