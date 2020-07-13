import { CommandStatus } from "@takomo/core"
import { DeployOrganizationOutput, PoliciesCleanResultHolder } from "../model"
import { buildOutput } from "../output"

export const cleanBasicConfiguration = async (
  holder: PoliciesCleanResultHolder,
): Promise<DeployOrganizationOutput> => {
  const {
    ctx,
    watch,
    io,
    result,
    plan: { organizationBasicConfigPlan },
  } = holder
  const childWatch = watch.startChild("clean-basic-config")

  if (result) {
    io.debug("Deploy already completed, cancel basic configuration clean")
    childWatch.stop()
    return buildOutput({
      ...holder,
      organizationBasicConfigCleanResult: {
        ...result,
      },
    })
  }

  if (!organizationBasicConfigPlan.hasChanges) {
    io.info("No basic configuration to clean")
    childWatch.stop()
    return buildOutput({
      ...holder,
      organizationBasicConfigCleanResult: {
        message: "Skipped",
        success: true,
        status: CommandStatus.SKIPPED,
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
      return buildOutput({
        ...holder,
        organizationBasicConfigCleanResult: {
          message: "Failed to disable AWS service access",
          success: false,
          status: CommandStatus.FAILED,
        },
      })
    }
  }

  return buildOutput({
    ...holder,
    organizationBasicConfigCleanResult: {
      message: "Success",
      success: true,
      status: CommandStatus.SUCCESS,
    },
  })
}
