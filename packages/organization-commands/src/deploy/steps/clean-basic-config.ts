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
