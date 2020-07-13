import { DetailedOrganizationalUnit } from "@takomo/aws-clients"
import {
  OrganizationalUnit,
  OrganizationalUnitPath,
} from "@takomo/organization-config"
import { OrganizationState } from "@takomo/organization-context"
import { Logger } from "@takomo/util"
import { OrganizationalUnitId } from "aws-sdk/clients/organizations"
import { EnabledPoliciesPlan, PlannedOrganizationalUnit } from "./model"
import { planOrganizationalUnitAdd } from "./plan-organizational-unit-add"
import { planOrganizationalUnitDelete } from "./plan-organizational-unit-delete"
import { planOrganizationalUnitUpdate } from "./plan-organizational-unit-update"

export const createOrganizationalUnitsDeploymentPlan = (
  logger: Logger,
  enabledPoliciesPlan: EnabledPoliciesPlan,
  ouPath: OrganizationalUnitPath,
  localOu: OrganizationalUnit | null,
  currentOu: DetailedOrganizationalUnit | null,
  organizationState: OrganizationState,
  parentId: OrganizationalUnitId | null,
): PlannedOrganizationalUnit => {
  // Delete
  if (!localOu && currentOu) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return planOrganizationalUnitDelete(
      logger,
      enabledPoliciesPlan,
      ouPath,
      currentOu,
      organizationState,
      parentId,
    )
    // Add
  } else if (localOu && !currentOu) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return planOrganizationalUnitAdd(
      logger,
      enabledPoliciesPlan,
      ouPath,
      localOu,
      organizationState,
      parentId,
    )

    // Update or skip
  } else if (localOu && currentOu) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return planOrganizationalUnitUpdate(
      logger,
      enabledPoliciesPlan,
      ouPath,
      localOu,
      currentOu,
      organizationState,
      parentId,
    )
  } else {
    throw new Error(`Assertion error`)
  }
}
