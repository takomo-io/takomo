import { PlannedOrganizationalUnit } from "../../common/plan/organizational-units/model"
import { OrganizationalUnitDeploymentResult } from "../model"

export const cancelOrganizationalUnits = (
  planned: PlannedOrganizationalUnit,
): ReadonlyArray<OrganizationalUnitDeploymentResult> => {
  const ou: OrganizationalUnitDeploymentResult = {
    id: planned.id,
    name: planned.name,
    message: "Cancelled due to earlier failures",
    success: false,
    status: "CANCELLED",
  }

  return planned.children.reduce(
    (collected, child) => [...collected, ...cancelOrganizationalUnits(child)],
    [ou],
  )
}
