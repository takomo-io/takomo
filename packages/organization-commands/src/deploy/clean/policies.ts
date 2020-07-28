import { CommandStatus, resolveCommandOutputBase } from "@takomo/core"
import flatten from "lodash.flatten"
import {
  DeployOrganizationOutput,
  OrganizationalUnitsCleanResultHolder,
  PolicyDeploymentResult,
} from "../model"
import { cleanBasicConfiguration } from "./basic-config"

export const cleanPolicies = async (
  holder: OrganizationalUnitsCleanResultHolder,
): Promise<DeployOrganizationOutput> => {
  const {
    ctx,
    watch,
    io,
    result,
    plan: {
      policiesPlan: {
        hasChanges,
        aiServicesOptOut,
        tag,
        backup,
        serviceControl,
      },
    },
  } = holder
  const childWatch = watch.startChild("clean-policies")

  if (result) {
    io.debug("Deploy already completed, cancel policies clean")
    childWatch.stop()
    return cleanBasicConfiguration({
      ...holder,
      policiesCleanResult: {
        ...result,
        results: [],
      },
    })
  }

  if (!hasChanges) {
    io.info("No policies to clean")
    childWatch.stop()
    return cleanBasicConfiguration({
      ...holder,
      policiesCleanResult: {
        message: "Skipped",
        success: true,
        status: CommandStatus.SKIPPED,
        results: [],
      },
    })
  }

  io.info("Clean policies")

  const client = ctx.getClient()

  const allPolicies = [serviceControl, backup, tag, aiServicesOptOut]
  const policiesToDelete = flatten(
    allPolicies.map((p) => p.remove.filter((s) => !s.awsManaged)),
  )

  io.info(`Delete ${policiesToDelete.length} policies`)
  const results = new Array<PolicyDeploymentResult>()
  for (const policyToDelete of policiesToDelete) {
    try {
      await client.deletePolicy(policyToDelete.id!)

      results.push({
        id: policyToDelete.id!,
        type: policyToDelete.type,
        name: policyToDelete.name,
        status: CommandStatus.SUCCESS,
        awsManaged: policyToDelete.awsManaged,
        success: true,
        message: "Deleted",
        policy: null,
      })
    } catch (e) {
      io.error(
        `Failed to delete policy '${policyToDelete.name}' of type '${policyToDelete.type}'`,
        e,
      )
      results.push({
        id: policyToDelete.id!,
        type: policyToDelete.type,
        name: policyToDelete.name,
        status: CommandStatus.FAILED,
        awsManaged: policyToDelete.awsManaged,
        success: false,
        message: e.message,
        policy: null,
      })
    }
  }

  const newResult = resolveCommandOutputBase(results)

  childWatch.stop()

  return cleanBasicConfiguration({
    ...holder,
    result: newResult.success ? null : newResult,
    policiesCleanResult: {
      ...newResult,
      results,
    },
  })
}
