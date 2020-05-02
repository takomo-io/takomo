import { CommandStatus, Constants } from "@takomo/core"
import { OrganizationBasicConfigDeploymentResultHolder } from "../../../model"
import { LaunchOrganizationOutput } from "../model"
import { deployOrganizationalUnits } from "./organizational-units"

export const deployPolicies = async (
  holder: OrganizationBasicConfigDeploymentResultHolder,
): Promise<LaunchOrganizationOutput> => {
  const {
    ctx,
    watch,
    io,
    result,
    plan: { policiesPlan },
    organizationData,
  } = holder
  const childWatch = watch.startChild("deploy-policies")

  const { currentTagPolicies, currentServiceControlPolicies } = organizationData

  if (result) {
    io.debug("Launch already completed, cancel policies deployment")
    childWatch.stop()
    return deployOrganizationalUnits({
      ...holder,
      policiesDeploymentResult: {
        ...result,
        results: [],
      },
    })
  }

  const client = ctx.getClient()

  if (!policiesPlan.hasChanges) {
    io.info("No changes to policies")
    childWatch.stop()
    return deployOrganizationalUnits({
      ...holder,
      policiesDeploymentResult: {
        results: [],
        message: "Skipped",
        success: true,
        status: CommandStatus.SKIPPED,
      },
    })
  }

  io.info("Deploy policies")

  const allPolicies = [
    ...policiesPlan.serviceControlPolicies,
    ...policiesPlan.tagPolicies,
  ]

  const policiesToAdd = allPolicies.filter((p) => p.operation === "add")
  const policiesToSkip = allPolicies.filter((p) => p.operation === "skip")
  const policiesToUpdate = allPolicies.filter((p) => p.operation === "update")

  io.info(`Skip ${policiesToSkip.length} policies`)
  const skippedPolicies = policiesToSkip.map((p) => ({
    id: p.id!,
    type: p.type,
    name: p.name,
    status: CommandStatus.SKIPPED,
    success: true,
    awsManaged: p.awsManaged,
    message: "No changes",
    policy: null,
  }))

  io.info(`Add ${policiesToAdd.length} policies`)
  const addedPolicies = await Promise.all(
    policiesToAdd.map((p) =>
      client
        .createPolicy({
          Type: p.type,
          Name: p.name,
          Content: p.newContent!,
          Description: p.newDescription!,
        })
        .then((policy) => ({
          id: policy.PolicySummary!.Id!,
          type: p.type,
          name: p.name,
          status: CommandStatus.SUCCESS,
          awsManaged: p.awsManaged,
          success: true,
          message: "Added",
          policy,
        }))
        .catch((e) => {
          io.error(`Failed to create policy '${p.name}' of type '${p.type}'`, e)
          return {
            id: p.id!,
            type: p.type,
            name: p.name,
            status: CommandStatus.FAILED,
            awsManaged: p.awsManaged,
            success: false,
            message: `Failed to create policy '${p.name}' of type '${p.type}': ${e.message}`,
            policy: null,
          }
        }),
    ),
  )

  io.info(`Update ${policiesToUpdate.length} policies`)
  const updatedPolicies = await Promise.all(
    policiesToUpdate.map((p) =>
      client
        .updatePolicy({
          PolicyId: p.id!,
          Name: p.name,
          Description: p.newDescription!,
          Content: p.newContent!,
        })
        .then((policy) => ({
          id: p.id!,
          type: p.type,
          name: p.name,
          status: CommandStatus.SUCCESS,
          awsManaged: p.awsManaged,
          success: true,
          message: "Updated",
          policy,
        }))
        .catch((e) => {
          io.error(`Failed to update policy '${p.name}' of type '${p.type}'`, e)
          return {
            id: p.id!,
            type: p.type,
            name: p.name,
            status: CommandStatus.FAILED,
            awsManaged: p.awsManaged,
            success: false,
            message: `Failed to update policy '${p.name}' of type '${p.type}': ${e.message}`,
            policy: null,
          }
        }),
    ),
  )

  const addedServiceControlPolicies = addedPolicies
    .filter((p) => p.type === Constants.SERVICE_CONTROL_POLICY_TYPE)
    .map((p) => p.policy!)

  const addedTagPolicies = addedPolicies
    .filter((p) => p.type === Constants.TAG_POLICY_TYPE)
    .map((p) => p.policy!)

  const results = [...skippedPolicies, ...addedPolicies, ...updatedPolicies]

  const failedPolicies = results.filter((r) => !r.success)
  const success = failedPolicies.length === 0
  const status = success ? CommandStatus.SUCCESS : CommandStatus.FAILED
  const message = success
    ? "Success"
    : failedPolicies.length > 0
    ? failedPolicies[0].message
    : "Failed"

  childWatch.stop()

  return deployOrganizationalUnits({
    ...holder,
    organizationData: {
      ...organizationData,
      currentServiceControlPolicies: [
        ...currentServiceControlPolicies,
        ...addedServiceControlPolicies,
      ],
      currentTagPolicies: [...currentTagPolicies, ...addedTagPolicies],
    },
    policiesDeploymentResult: {
      message,
      success,
      results,
      status,
    },
  })
}
