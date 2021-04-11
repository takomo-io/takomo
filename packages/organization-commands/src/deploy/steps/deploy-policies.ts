import { FAILED, resolveCommandOutputBase, SUCCESS } from "@takomo/core"
import { PolicyDeploymentResult } from "../model"
import { BasicConfigDeploymentResultHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

export const deployPolicies: DeployOrganizationStep<BasicConfigDeploymentResultHolder> = async (
  state,
) => {
  const { transitions, io, ctx, policiesPlan, organizationState } = state

  const {
    hasChanges,
    aiServicesOptOut,
    backup,
    serviceControl,
    tag,
  } = policiesPlan

  const client = ctx.getClient()

  if (!hasChanges) {
    io.info("No changes to policies")
    return transitions.deployOrganizationalUnits({
      ...state,
      policiesDeploymentResult: {
        message: "No changes",
        success: true,
        status: "SUCCESS",
      },
    })
  }

  io.info("Deploy policies")

  const allPolicies = [serviceControl, backup, tag, aiServicesOptOut]
  const policiesToAdd = allPolicies.map((p) => p.add).flat()
  const policiesToSkip = allPolicies.map((p) => p.skip).flat()
  const policiesToUpdate = allPolicies.map((p) => p.update).flat()

  io.info(`Skip ${policiesToSkip.length} policies`)
  const skippedPolicies = policiesToSkip.map((p) => ({
    id: p.id,
    type: p.type,
    name: p.name,
    status: SUCCESS,
    success: true,
    awsManaged: p.awsManaged,
    message: "No changes",
  }))

  io.info(`Create ${policiesToAdd.length} policies`)
  const addedPolicies: ReadonlyArray<PolicyDeploymentResult> = await Promise.all(
    policiesToAdd.map((p) =>
      client
        .createPolicy({
          Type: p.type,
          Name: p.name,
          Content: p.newContent!,
          Description: p.newDescription!,
        })
        .then((policy) => ({
          policy,
          type: p.type,
          name: p.name,
          awsManaged: p.awsManaged,
          success: true,
          status: SUCCESS,
          message: "Policy create succeeded",
        }))
        .catch((error) => {
          io.error(
            `Failed to add policy '${p.name}' of type '${p.type}'`,
            error,
          )
          return {
            type: p.type,
            name: p.name,
            awsManaged: p.awsManaged,
            success: false,
            status: FAILED,
            message: "Policy create failed",
            error,
          }
        }),
    ),
  )

  io.info(`Update ${policiesToUpdate.length} policies`)
  const updatedPolicies: ReadonlyArray<PolicyDeploymentResult> = await Promise.all(
    policiesToUpdate.map((p) =>
      client
        .updatePolicy({
          PolicyId: p.id!,
          Name: p.name,
          Description: p.newDescription!,
          Content: p.newContent!,
        })
        .then((policy) => ({
          policy,
          type: p.type,
          name: p.name,
          awsManaged: p.awsManaged,
          success: true,
          status: SUCCESS,
          message: "Policy update succeeded",
        }))
        .catch((error) => {
          io.error(
            `Failed to update policy '${p.name}' of type '${p.type}'`,
            error,
          )
          return {
            type: p.type,
            name: p.name,
            awsManaged: p.awsManaged,
            success: false,
            status: FAILED,
            message: "Policy update failed",
            error,
          }
        }),
    ),
  )

  // TODO: Fix mutating of state
  addedPolicies.concat(updatedPolicies).forEach((p) => {
    organizationState.setPolicy(
      p.policy!.summary.type,
      p.policy!.summary.name,
      p.policy!,
    )
  })

  const results = [...skippedPolicies, ...addedPolicies, ...updatedPolicies]

  return transitions.deployOrganizationalUnits({
    ...state,
    policiesDeploymentResult: {
      ...resolveCommandOutputBase(results),
    },
  })
}
