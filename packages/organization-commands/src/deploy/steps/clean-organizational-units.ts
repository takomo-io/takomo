import { OrganizationsClient } from "@takomo/aws-clients"
import { CANCELLED, FAILED, SUCCESS } from "@takomo/core"
import { collectFromHierarchy } from "@takomo/util"
import { PlannedOrganizationalUnit } from "../../common/plan/organizational-units/model"
import { OrganizationalUnitDeploymentResult } from "../model"
import { OrganizationalUnitsDeploymentResultHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

const removeOrganizationalUnits = async (
  client: OrganizationsClient,
  planned: PlannedOrganizationalUnit,
): Promise<ReadonlyArray<OrganizationalUnitDeploymentResult>> => {
  const results = new Array<OrganizationalUnitDeploymentResult>()

  if (planned.operation === "delete") {
    const collectedOus = collectFromHierarchy(planned, (p) => p.children)
      .slice()
      .reverse()
    let failed = false
    for (const ou of collectedOus) {
      if (failed) {
        results.push({
          id: ou.id!,
          name: ou.name,
          message: "Cancelled",
          success: false,
          status: CANCELLED,
        })

        continue
      }

      const result = await client
        .deleteOrganizationalUnit(ou.id!)
        .then(
          () =>
            ({
              id: ou.id!,
              name: ou.name,
              message: "Deleted",
              success: true,
              status: SUCCESS,
            } as OrganizationalUnitDeploymentResult),
        )
        .catch(
          (error) =>
            ({
              id: ou.id!,
              name: ou.name,
              message: error.message,
              success: false,
              status: FAILED,
              error,
            } as OrganizationalUnitDeploymentResult),
        )

      if (!result.success) {
        failed = true
      }

      results.push(result)
    }
  } else {
    for (const child of planned.children) {
      const childResults = await removeOrganizationalUnits(client, child)
      childResults.forEach((r) => results.push(r))
    }
  }

  return results
}

export const cleanOrganizationalUnits: DeployOrganizationStep<OrganizationalUnitsDeploymentResultHolder> = async (
  state,
) => {
  const { transitions, ctx, io, organizationalUnitsPlan } = state

  const client = ctx.getClient()

  if (!organizationalUnitsPlan.hasChanges) {
    io.info("No organizational units to clean")
    return transitions.cleanPolicies({
      ...state,
      organizationalUnitsCleanResult: {
        message: "No changes",
        status: "SUCCESS",
        success: true,
      },
    })
  }

  io.info("Clean organizational units")
  const results = await removeOrganizationalUnits(
    client,
    organizationalUnitsPlan.root!,
  )

  const success = !results.some((r) => !r.success)
  return transitions.cleanPolicies({
    ...state,
    organizationalUnitsCleanResult: {
      success,
      status: success ? "SUCCESS" : "FAILED",
      message: success ? "Clean succeeded" : "Clean failed",
    },
  })
}
