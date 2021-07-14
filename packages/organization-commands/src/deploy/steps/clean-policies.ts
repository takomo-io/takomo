import { OrganizationsClient } from "@takomo/aws-clients"
import { FAILED, SUCCESS } from "@takomo/core"
import { PlannedPolicy } from "../../common/plan/policies/model"
import { PolicyDeploymentResult } from "../model"
import { OrganizationalUnitsCleanResultHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

const deletePolicies = async (
  client: OrganizationsClient,
  policiesToDelete: ReadonlyArray<PlannedPolicy>,
  results: ReadonlyArray<PolicyDeploymentResult>,
): Promise<ReadonlyArray<PolicyDeploymentResult>> => {
  const [policyToDelete, ...rest] = policiesToDelete

  if (!policyToDelete) {
    return results
  }

  if (!policyToDelete.id) {
    throw new Error(`Expected policy id to be defined`)
  }

  const result = await client
    .deletePolicy(policyToDelete.id)
    .then(() => ({
      type: policyToDelete.type,
      name: policyToDelete.name,
      awsManaged: policyToDelete.awsManaged,
      success: true,
      status: SUCCESS,
      message: "Policy delete succeeded",
    }))
    .catch((error) => ({
      type: policyToDelete.type,
      name: policyToDelete.name,
      awsManaged: policyToDelete.awsManaged,
      success: false,
      status: FAILED,
      message: "Policy delete failed",
      error,
    }))

  return deletePolicies(client, rest, [...results, result])
}

export const cleanPolicies: DeployOrganizationStep<OrganizationalUnitsCleanResultHolder> =
  async (state) => {
    const {
      transitions,
      ctx,
      io,
      totalTimer,
      policiesPlan: {
        hasChanges,
        aiServicesOptOut,
        tag,
        backup,
        serviceControl,
      },
    } = state

    const timer = totalTimer.startChild("clean-policies")

    if (!hasChanges) {
      timer.stop()
      io.info("No policies to clean")
      return transitions.completeOrganizationDeploy({
        ...state,
        message: "Success",
        policiesCleanResult: {
          message: "No changes",
          success: true,
          status: "SUCCESS",
        },
      })
    }

    io.info("Clean policies")

    const client = await ctx.getClient()

    const allPolicies = [serviceControl, backup, tag, aiServicesOptOut]
    const policiesToDelete = allPolicies
      .map((p) => p.remove.filter((s) => !s.awsManaged))
      .flat()

    io.info(`Delete ${policiesToDelete.length} policies`)
    const results = await deletePolicies(client, policiesToDelete, [])
    const success = !results.some((r) => !r.success)
    timer.stop()

    return transitions.completeOrganizationDeploy({
      ...state,
      message: "Success",
      policiesCleanResult: {
        success,
        status: success ? "SUCCESS" : "FAILED",
        message: success ? "Clean succeeded" : "Clean failed",
      },
    })
  }
