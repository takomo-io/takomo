import { CommandStatus, resolveCommandOutputBase } from "@takomo/core"
import { OrganizationalUnitsCleanResultHolder } from "../../../model"
import { DeployOrganizationOutput } from "../model"
import { cleanBasicConfiguration } from "./basic-config"

export const cleanPolicies = async (
  holder: OrganizationalUnitsCleanResultHolder,
): Promise<DeployOrganizationOutput> => {
  const {
    ctx,
    watch,
    io,
    result,
    plan: { policiesPlan },
  } = holder
  const childWatch = watch.startChild("clean-policies")

  if (result) {
    io.debug("Launch already completed, cancel policies clean")
    childWatch.stop()
    return cleanBasicConfiguration({
      ...holder,
      policiesCleanResult: {
        ...result,
        results: [],
      },
    })
  }

  if (!policiesPlan.hasChanges) {
    io.info("No policies to clean")
    childWatch.stop()
    return cleanBasicConfiguration({
      ...holder,
      policiesCleanResult: {
        message: "Skipped",
        success: true,
        status: CommandStatus.SKIPPED,
        results: [],
      },
    })
  }

  io.info("Clean policies")

  const client = ctx.getClient()

  const allPolicies = [
    ...policiesPlan.serviceControlPolicies,
    ...policiesPlan.tagPolicies,
    ...policiesPlan.aiServicesOptOutPolicies,
  ]

  const policiesToDelete = allPolicies
    .filter((p) => !p.awsManaged)
    .filter((p) => p.operation === "delete")

  io.info(`Delete ${policiesToDelete.length} policies`)
  const results = await Promise.all(
    policiesToDelete.map((p) =>
      client
        .deletePolicy(p.id!)
        .then(() => ({
          id: p.id!,
          type: p.type,
          name: p.name,
          status: CommandStatus.SUCCESS,
          awsManaged: p.awsManaged,
          success: true,
          message: "Deleted",
          policy: null,
        }))
        .catch((e) => ({
          id: p.id!,
          type: p.type,
          name: p.name,
          status: CommandStatus.FAILED,
          awsManaged: p.awsManaged,
          success: false,
          message: e.message,
          policy: null,
        })),
    ),
  )

  const newResult = resolveCommandOutputBase(results)

  childWatch.stop()

  return cleanBasicConfiguration({
    ...holder,
    result: newResult.success ? null : newResult,
    policiesCleanResult: {
      ...newResult,
      results,
    },
  })
}
