import { OrganizationsClient } from "@takomo/aws-clients"
import { OrganizationalUnitId, OrganizationPolicyType } from "@takomo/aws-model"
import { OrganizationState } from "@takomo/organization-context"
import { TkmLogger } from "@takomo/util"
import { PlannedOrganizationalUnit } from "../../common/plan/organizational-units/model"
import { OrganizationalUnitDeploymentResult } from "../model"
import { addOrganizationalUnit } from "./add-organizational-unit"
import { skipOrganizationalUnit } from "./skip-organizational-unit"
import { updateOrganizationalUnit } from "./update-organizational-unit"

export const addOrUpdateOrganizationalUnits = async (
  logger: TkmLogger,
  client: OrganizationsClient,
  enabledPolicyTypes: ReadonlyArray<OrganizationPolicyType>,
  serviceControlPoliciesJustEnabled: boolean,
  organizationState: OrganizationState,
  planned: PlannedOrganizationalUnit,
  parentId: OrganizationalUnitId | null,
): Promise<ReadonlyArray<OrganizationalUnitDeploymentResult>> => {
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
