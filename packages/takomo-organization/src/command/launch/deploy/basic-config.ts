import { CommandStatus } from "@takomo/core"
import { DeploymentPlanHolder } from "../../../model"
import { LaunchOrganizationOutput } from "../model"
import { deployPolicies } from "./policies"

export const deployBasicConfiguration = async (
  holder: DeploymentPlanHolder,
): Promise<LaunchOrganizationOutput> => {
  const {
    ctx,
    watch,
    io,
    result,
    plan: { organizationBasicConfigPlan },
    organizationData: { currentRootOrganizationalUnit },
  } = holder
  const childWatch = watch.startChild("deploy-basic-config")

  if (result) {
    io.debug("Launch already completed, cancel basic config deployment")
    childWatch.stop()
    return deployPolicies({
      ...holder,
      organizationBasicConfigDeploymentResult: {
        ...result,
      },
    })
  }

  if (!organizationBasicConfigPlan.hasChanges) {
    io.info("No changes to basic config")
    childWatch.stop()
    return deployPolicies({
      ...holder,
      organizationBasicConfigDeploymentResult: {
        success: true,
        message: "Skipped",
        status: CommandStatus.SKIPPED,
      },
    })
  }

  io.info("Deploy basic config")

  const client = ctx.getClient()

  for (const policy of organizationBasicConfigPlan.enabledPolicies.add) {
    io.info(`Enable policy type: ${policy}`)
    await client.enablePolicyType({
      PolicyType: policy,
      RootId: currentRootOrganizationalUnit.ou.Id!,
    })

    await client.waitUntilPolicyTypeIsEnabled(policy, 60000)
  }

  for (const policy of organizationBasicConfigPlan.enabledPolicies.remove) {
    io.info(`Disable policy type: ${policy}`)
    await client.disablePolicyType({
      PolicyType: policy,
      RootId: currentRootOrganizationalUnit.ou.Id!,
    })

    await client.waitUntilPolicyTypeIsDisabled(policy, 60000)
  }

  for (const service of organizationBasicConfigPlan.trustedServices.add) {
    io.info(`Enable AWS service: ${service}`)
    await client.enableAWSServiceAccess(service)
  }

  childWatch.stop()

  return deployPolicies({
    ...holder,
    organizationBasicConfigDeploymentResult: {
      success: true,
      message: "Success",
      status: CommandStatus.SUCCESS,
    },
  })
}
