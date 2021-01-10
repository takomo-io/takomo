import { OrganizationsClient } from "@takomo/aws-clients"
import { FAILED, resolveCommandOutputBase, SUCCESS } from "@takomo/core"
import flatten from "lodash.flatten"
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
      message: "Deleted",
    }))
    .catch((error) => ({
      type: policyToDelete.type,
      name: policyToDelete.name,
      awsManaged: policyToDelete.awsManaged,
      success: false,
      status: FAILED,
      message: "An error occurred",
      error,
    }))

  return deletePolicies(client, rest, [...results, result])
}

export const cleanPolicies: DeployOrganizationStep<OrganizationalUnitsCleanResultHolder> = async (
  state,
) => {
  const {
    transitions,
    ctx,
    io,
    policiesPlan: { hasChanges, aiServicesOptOut, tag, backup, serviceControl },
  } = state

  if (!hasChanges) {
    io.info("No policies to clean")
    return transitions.cleanBasicConfig({
      ...state,
      policiesCleanResult: {
        message: "Skipped",
        success: true,
        status: "SKIPPED",
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
  const results = await deletePolicies(client, policiesToDelete, [])

  return transitions.cleanBasicConfig({
    ...state,
    policiesCleanResult: {
      ...resolveCommandOutputBase(results),
      results,
    },
  })
}
