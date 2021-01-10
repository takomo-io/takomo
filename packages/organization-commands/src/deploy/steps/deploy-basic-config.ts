import { OrganizationalUnitsPlanHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

export const deployBasicConfig: DeployOrganizationStep<OrganizationalUnitsPlanHolder> = async (
  state,
) => {
  const {
    transitions,
    organizationBasicConfigPlan,
    io,
    ctx,
    organizationState,
  } = state

  const { rootOrganizationalUnit } = organizationState

  if (!organizationBasicConfigPlan.hasChanges) {
    io.info("No changes to basic config")
    return transitions.deployPolicies({
      ...state,
      organizationBasicConfigDeploymentResult: {
        success: true,
        message: "Skipped",
        status: "SKIPPED",
      },
    })
  }

  io.info("Deploy basic config")

  const client = ctx.getClient()

  for (const policy of organizationBasicConfigPlan.enabledPolicies.add) {
    io.info(`Enable policy type: ${policy}`)
    await client.enablePolicyType({
      PolicyType: policy,
      RootId: rootOrganizationalUnit.ou.id,
    })

    await client.waitUntilPolicyTypeIsEnabled(policy, 60000)
  }

  for (const policy of organizationBasicConfigPlan.enabledPolicies.remove) {
    io.info(`Disable policy type: ${policy}`)
    await client.disablePolicyType({
      PolicyType: policy,
      RootId: rootOrganizationalUnit.ou.id,
    })

    await client.waitUntilPolicyTypeIsDisabled(policy, 60000)
  }

  for (const service of organizationBasicConfigPlan.trustedServices.add) {
    io.info(`Enable AWS service: ${service}`)
    await client.enableAWSServiceAccess(service)
  }

  return transitions.deployPolicies({
    ...state,
    organizationBasicConfigDeploymentResult: {
      success: true,
      message: "Success",
      status: "SUCCESS",
    },
  })
}
