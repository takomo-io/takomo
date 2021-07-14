import { OrganizationalUnitsPlanHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

export const deployBasicConfig: DeployOrganizationStep<OrganizationalUnitsPlanHolder> =
  async (state) => {
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

    const client = await ctx.getClient()

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

    return transitions.deployPolicies({
      ...state,
      basicConfigDeploymentResult: {
        success: true,
        message: "Deploy succeeded",
        status: "SUCCESS",
      },
    })
  }
