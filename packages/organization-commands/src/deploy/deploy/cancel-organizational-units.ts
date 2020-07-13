import { CommandStatus } from "@takomo/core"
import { OrganizationalUnitDeploymentResult } from "../model"
import { PlannedOrganizationalUnit } from "../plan/model"

export const cancelOrganizationalUnits = (
  planned: PlannedOrganizationalUnit,
): OrganizationalUnitDeploymentResult[] => {
  const ou = {
    id: planned.id,
    name: planned.name,
    message: "Cancelled due to earlier failures",
    success: false,
    status: CommandStatus.CANCELLED,
  }

  return planned.children.reduce(
    (collected, child) => [...collected, ...cancelOrganizationalUnits(child)],
    [ou],
  )
}
