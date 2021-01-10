import { OrganizationsClient } from "@takomo/aws-clients"
import { OrganizationPolicyType } from "@takomo/aws-model"
import { OrganizationState } from "@takomo/organization-context"
import { TkmLogger } from "@takomo/util"
import { PlannedOrganizationalUnit } from "../../common/plan/organizational-units/model"
import { OrganizationalUnitDeploymentResult } from "../model"
import { addOrUpdateOrganizationalUnits } from "./add-or-update-organizational-units"

export const skipOrganizationalUnit = async (
  logger: TkmLogger,
  client: OrganizationsClient,
  enabledPolicyTypes: ReadonlyArray<OrganizationPolicyType>,
  serviceControlPoliciesJustEnabled: boolean,
  organizationState: OrganizationState,
  planned: PlannedOrganizationalUnit,
): Promise<ReadonlyArray<OrganizationalUnitDeploymentResult>> => {
  const results = new Array<OrganizationalUnitDeploymentResult>()

  logger.info(`Skip organizational unit: ${planned.path}`)

  results.push({
    id: planned.id!,
    name: planned.name,
    message: "No changes",
    success: true,
    status: "SKIPPED",
  })

  for (const child of planned.children) {
    const childResults = await addOrUpdateOrganizationalUnits(
      logger,
      client,
      enabledPolicyTypes,
      serviceControlPoliciesJustEnabled,
      organizationState,
      child,
      planned.id!,
    )
    childResults.forEach((c) => results.push(c))
  }

  return results
}
