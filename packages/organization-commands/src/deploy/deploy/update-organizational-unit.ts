import { OrganizationsClient } from "@takomo/aws-clients"
import { OrganizationPolicyType } from "@takomo/aws-model"
import { OrganizationState } from "@takomo/organization-context"
import { TkmLogger } from "@takomo/util"
import flatten from "lodash.flatten"
import { PlannedOrganizationalUnit } from "../../common/plan/organizational-units/model"
import { OrganizationalUnitDeploymentResult } from "../model"
import { addOrUpdateOrganizationalUnits } from "./add-or-update-organizational-units"
import { attachAndDetachPolicies } from "./attach-and-detach-policies"
import { cancelOrganizationalUnits } from "./cancel-organizational-units"

export const updateOrganizationalUnit = async (
  logger: TkmLogger,
  client: OrganizationsClient,
  enabledPolicyTypes: ReadonlyArray<OrganizationPolicyType>,
  serviceControlPoliciesJustEnabled: boolean,
  organizationState: OrganizationState,
  planned: PlannedOrganizationalUnit,
): Promise<OrganizationalUnitDeploymentResult[]> => {
  const results = new Array<OrganizationalUnitDeploymentResult>()

  logger.info(`Update organizational unit: ${planned.path}`)

  if (
    !(await attachAndDetachPolicies(
      logger,
      client,
      enabledPolicyTypes,
      serviceControlPoliciesJustEnabled,
      organizationState,
      "organizational unit",
      planned.id!,
      planned.policies,
    ))
  ) {
    logger.warn(
      `Attaching and detaching policies for organizational unit with path '${planned.path}' failed, cancel the remaining organizational units`,
    )
    return [
      ...results,
      {
        id: planned.id!,
        name: planned.name,
        success: false,
        status: "FAILED",
        message: "Policies failed",
      },
      ...flatten(planned.children.map(cancelOrganizationalUnits)),
    ]
  }

  for (const account of [...planned.accounts.add]) {
    const accountId = account.id
    const currentOu = organizationState.getParentOrganizationalUnit(accountId)
    const newOu = planned.id!
    logger.info(
      `Move account ${accountId} from organizational unit ${currentOu.id} to ${newOu}`,
    )

    if (
      !(await client.moveAccount({
        AccountId: accountId,
        DestinationParentId: newOu,
        SourceParentId: currentOu.id,
      }))
    ) {
      logger.warn(
        `Moving account '${accountId}' to organizational unit with path '${planned.path}' failed, cancel the remaining organizational units`,
      )

      return [
        ...results,
        {
          id: planned.id!,
          name: planned.name,
          success: false,
          status: "FAILED",
          message: "Accounts failed",
        },
        ...flatten(planned.children.map(cancelOrganizationalUnits)),
      ]
    }
  }

  for (const account of [...planned.accounts.add, ...planned.accounts.retain]) {
    const accountId = account.id

    if (
      !(await attachAndDetachPolicies(
        logger,
        client,
        enabledPolicyTypes,
        serviceControlPoliciesJustEnabled,
        organizationState,
        "account",
        accountId,
        account.policies,
      ))
    ) {
      logger.warn(
        `Attaching and detaching policies for account '${accountId}' of organizational unit with path '${planned.path}' failed, cancel the remaining organizational units`,
      )
      return [
        ...results,
        {
          id: planned.id!,
          name: planned.name,
          success: false,
          status: "FAILED",
          message: "Accounts failed",
        },
        ...flatten(planned.children.map(cancelOrganizationalUnits)),
      ]
    }
  }

  results.push({
    id: planned.id!,
    name: planned.name,
    message: "Updated",
    success: true,
    status: "SUCCESS",
  })

  for (const child of planned.children) {
    const childResults = await addOrUpdateOrganizationalUnits(
      logger,
      client,
      enabledPolicyTypes,
      serviceControlPoliciesJustEnabled,
      organizationState,
      child,
      planned.id,
    )

    childResults.forEach((c) => results.push(c))
  }

  return results
}
