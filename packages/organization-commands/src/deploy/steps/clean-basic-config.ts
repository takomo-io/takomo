import { PoliciesCleanResultHolder } from "../states"
import { DeployOrganizationStep } from "../steps"

export const cleanBasicConfig: DeployOrganizationStep<PoliciesCleanResultHolder> = async (
  state,
) => {
  const { transitions, ctx, io, basicConfigPlan } = state

  if (!basicConfigPlan.hasChanges) {
    io.info("No basic configuration to clean")
    return transitions.completeOrganizationDeploy({
      ...state,
      message: "Success",
      basicConfigCleanResult: {
        message: "No changes",
        success: true,
        status: "SUCCESS",
      },
    })
  }

  io.info("Clean policies")

  const client = ctx.getClient()

  for (const service of basicConfigPlan.trustedServices.remove) {
    io.info(`Disable AWS service: ${service}`)

    try {
      await client.disableAWSServiceAccess(service)
    } catch (error) {
      io.error(`Failed to disable AWS service access: '${service}'`, error)
      return transitions.completeOrganizationDeploy({
        ...state,
        message: "Failed",
        basicConfigCleanResult: {
          error,
          success: false,
          message: "Clean failed",
          status: "FAILED",
        },
      })
    }
  }

  return transitions.completeOrganizationDeploy({
    ...state,
    message: "Success",
    basicConfigCleanResult: {
      message: "Clean succeeded",
      success: true,
      status: "SUCCESS",
    },
  })
}
