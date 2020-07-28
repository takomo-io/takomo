import { DetailedOrganizationalUnit } from "@takomo/aws-clients"
import { OrganizationState } from "@takomo/organization-context"
import { Logger } from "@takomo/util"
import { createOrgEntityPoliciesPlan } from "./create-org-entity-policies-plan"
import { createOrganizationalUnitsDeploymentPlan } from "./create-organizational-units-deployment-plan"
import { EnabledPoliciesPlan, PlannedOrganizationalUnit } from "./model"

export const planOrganizationalUnitDelete = (
  logger: Logger,
  enabledPoliciesPlan: EnabledPoliciesPlan,
  ouPath: string,
  currentOu: DetailedOrganizationalUnit,
  organizationState: OrganizationState,
  parentId: string | null,
): PlannedOrganizationalUnit => {
  logger.debug(
    `Plan delete for OU with path: '${ouPath}', id: ${currentOu.ou.Id}`,
  )

  const policies = createOrgEntityPoliciesPlan(
    logger,
    currentOu.ou.Id!,
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
      `${ouPath}/${child.ou.Name}`,
      null,
      child,
      organizationState,
      currentOu.ou.Id!,
    ),
  )

  return {
    children,
    parentId,
    policies,
    path: ouPath,
    priority: 0,
    id: currentOu.ou.Id!,
    name: currentOu.ou.Name!,
    operation: "delete",
    accounts: {
      add: [],
      retain: [],
      remove: currentOu.accounts.map((a) => ({
        id: a.Id!,
        operation: "delete",
        policies: createOrgEntityPoliciesPlan(
          logger,
          a.Id!,
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
