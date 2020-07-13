import { OrganizationsClient } from "@takomo/aws-clients"
import { CommandStatus } from "@takomo/core"
import { OrganizationState } from "@takomo/organization-context"
import { Logger } from "@takomo/util"
import { PolicyType } from "aws-sdk/clients/organizations"
import { OrganizationalUnitDeploymentResult } from "../model"
import { PlannedOrganizationalUnit } from "../plan/model"
import { addOrUpdateOrganizationalUnits } from "./add-or-update-organizational-units"

export const skipOrganizationalUnit = async (
  logger: Logger,
  client: OrganizationsClient,
  enabledPolicyTypes: PolicyType[],
  serviceControlPoliciesJustEnabled: boolean,
  organizationState: OrganizationState,
  planned: PlannedOrganizationalUnit,
): Promise<OrganizationalUnitDeploymentResult[]> => {
  const results = new Array<OrganizationalUnitDeploymentResult>()

  logger.info(`Skip organizational unit: ${planned.path}`)

  results.push({
    id: planned.id!,
    name: planned.name,
    message: "No changes",
    success: true,
    status: CommandStatus.SKIPPED,
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
