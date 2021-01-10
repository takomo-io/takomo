import { PoliciesCleanResultHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

export const cleanBasicConfig: DeployOrganizationStep<PoliciesCleanResultHolder> = async (
  state,
) => {
  const { transitions, ctx, io, organizationBasicConfigPlan } = state

  if (!organizationBasicConfigPlan.hasChanges) {
    io.info("No basic configuration to clean")
    return transitions.completeOrganizationDeploy({
      ...state,
      message: "Success",
      organizationBasicConfigCleanResult: {
        message: "Skipped",
        success: true,
        status: "SKIPPED",
      },
    })
  }

  io.info("Clean policies")

  const client = ctx.getClient()

  for (const service of organizationBasicConfigPlan.trustedServices.remove) {
    io.info(`Disable AWS service: ${service}`)

    try {
      await client.disableAWSServiceAccess(service)
    } catch (e) {
      io.error(`Failed to disable AWS service access: '${service}'`, e)
      return transitions.failOrganizationDeploy({
        ...state,
        message: "Failed",
        organizationBasicConfigCleanResult: {
          message: "Failed to disable AWS service access",
          success: false,
          status: "FAILED",
        },
      })
    }
  }

  return transitions.completeOrganizationDeploy({
    ...state,
    message: "Success",
    organizationBasicConfigCleanResult: {
      message: "Success",
      success: true,
      status: "SUCCESS",
    },
  })
}
