import { OrganizationsClient } from "@takomo/aws-clients"
import { CommandStatus, resolveCommandOutputBase } from "@takomo/core"
import { collectFromHierarchy } from "@takomo/util"
import {
  OrganizationalUnitDeploymentResult,
  OrganizationalUnitsDeploymentResultHolder,
  PlannedOrganizationalUnit,
} from "../../../model"
import { LaunchOrganizationOutput } from "../model"
import { cleanPolicies } from "./policies"

export const removeOrganizationalUnits = async (
  client: OrganizationsClient,
  planned: PlannedOrganizationalUnit,
): Promise<OrganizationalUnitDeploymentResult[]> => {
  const results = new Array<OrganizationalUnitDeploymentResult>()

  if (planned.operation === "delete") {
    const collectedOus = collectFromHierarchy(
      planned,
      (p) => p.children,
    ).reverse()
    let failed = false
    for (const ou of collectedOus) {
      if (failed) {
        results.push({
          id: ou.id!,
          name: ou.currentName!,
          message: "Cancelled",
          success: false,
          status: CommandStatus.CANCELLED,
        })

        continue
      }

      const result = await client
        .deleteOrganizationalUnit(ou.id!)
        .then(() => ({
          id: ou.id!,
          name: ou.currentName!,
          message: "Deleted",
          success: true,
          status: CommandStatus.SUCCESS,
        }))
        .catch((e) => ({
          id: ou.id!,
          name: ou.currentName!,
          message: e.message,
          success: false,
          status: CommandStatus.FAILED,
        }))

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

export const cleanOrganizationalUnits = async (
  holder: OrganizationalUnitsDeploymentResultHolder,
): Promise<LaunchOrganizationOutput> => {
  const {
    ctx,
    watch,
    io,
    result,
    plan: { organizationalUnitsPlan },
  } = holder
  const childWatch = watch.startChild("clean-organizational-units")

  const client = ctx.getClient()

  if (result) {
    io.debug("Launch already completed, cancel organizational units clean")
    childWatch.stop()
    return cleanPolicies({
      ...holder,
      organizationalUnitsCleanResult: {
        ...result,
        results: [],
      },
    })
  }

  if (!organizationalUnitsPlan.hasChanges) {
    io.info("No organizational units to clean")
    childWatch.stop()
    return cleanPolicies({
      ...holder,
      organizationalUnitsCleanResult: {
        message: "Skipped",
        status: CommandStatus.SKIPPED,
        success: true,
        results: [],
      },
    })
  }

  io.info("Clean organizational units")
  const results = await removeOrganizationalUnits(
    client,
    organizationalUnitsPlan.root!,
  )

  const newResult = resolveCommandOutputBase(results)

  childWatch.stop()

  return cleanPolicies({
    ...holder,
    result: newResult.success ? null : newResult,
    organizationalUnitsCleanResult: {
      ...newResult,
      results,
    },
  })
}
