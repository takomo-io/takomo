import { OrganizationsClient } from "@takomo/aws-clients"
import { OrganizationState } from "@takomo/organization-context"
import { Logger } from "@takomo/util"
import { OrganizationalUnitId, PolicyType } from "aws-sdk/clients/organizations"
import { OrganizationalUnitDeploymentResult } from "../model"
import { PlannedOrganizationalUnit } from "../plan/model"
import { addOrganizationalUnit } from "./add-organizational-unit"
import { skipOrganizationalUnit } from "./skip-organizational-unit"
import { updateOrganizationalUnit } from "./update-organizational-unit"

export const addOrUpdateOrganizationalUnits = async (
  logger: Logger,
  client: OrganizationsClient,
  enabledPolicyTypes: PolicyType[],
  serviceControlPoliciesJustEnabled: boolean,
  organizationState: OrganizationState,
  planned: PlannedOrganizationalUnit,
  parentId: OrganizationalUnitId | null,
): Promise<OrganizationalUnitDeploymentResult[]> => {
  switch (planned.operation) {
    case "add":
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return await addOrganizationalUnit(
        logger,
        client,
        enabledPolicyTypes,
        serviceControlPoliciesJustEnabled,
        organizationState,
        planned,
        parentId!,
      )
    case "update":
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return updateOrganizationalUnit(
        logger,
        client,
        enabledPolicyTypes,
        serviceControlPoliciesJustEnabled,
        organizationState,
        planned,
      )
    case "skip":
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return skipOrganizationalUnit(
        logger,
        client,
        enabledPolicyTypes,
        serviceControlPoliciesJustEnabled,
        organizationState,
        planned,
      )
    default:
      return []
  }
}
