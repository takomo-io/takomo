import { createRamClient } from "@takomo/aws-clients"
import { uuid } from "@takomo/util"
import { OrganizationalUnitsPlanHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

export const deployBasicConfig: DeployOrganizationStep<OrganizationalUnitsPlanHolder> = async (
  state,
) => {
  const { transitions, basicConfigPlan, io, ctx, organizationState } = state

  const { rootOrganizationalUnit } = organizationState

  if (!basicConfigPlan.hasChanges) {
    io.info("No changes to basic config")
    return transitions.deployPolicies({
      ...state,
      basicConfigDeploymentResult: {
        success: true,
        message: "No changes",
        status: "SUCCESS",
      },
    })
  }

  io.info("Deploy basic config")

  const client = ctx.getClient()

  for (const policy of basicConfigPlan.enabledPolicies.add) {
    io.info(`Enable policy type: ${policy}`)
    await client.enablePolicyType({
      PolicyType: policy,
      RootId: rootOrganizationalUnit.ou.id,
    })

    await client.waitUntilPolicyTypeIsEnabled(policy, 60000)
  }

  for (const policy of basicConfigPlan.enabledPolicies.remove) {
    io.info(`Disable policy type: ${policy}`)
    await client.disablePolicyType({
      PolicyType: policy,
      RootId: rootOrganizationalUnit.ou.id,
    })

    await client.waitUntilPolicyTypeIsDisabled(policy, 60000)
  }

  for (const service of basicConfigPlan.trustedServices.add) {
    io.info(`Enable AWS service: ${service}`)
    await client.enableAWSServiceAccess(service)

    // TODO: Move this logic elsewhere
    if (service === "ram.amazonaws.com") {
      const ram = createRamClient({
        region: "us-east-1",
        credentialManager: ctx.credentialManager,
        logger: io,
        id: uuid(),
      })

      await ram.enableSharingWithAwsOrganization()
    }
  }

  return transitions.deployPolicies({
    ...state,
    basicConfigDeploymentResult: {
      success: true,
      message: "Deploy succeeded",
      status: "SUCCESS",
    },
  })
}
