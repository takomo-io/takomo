import { CommandStatus } from "@takomo/core"
import { collectFromHierarchy, TakomoError } from "@takomo/util"
import flatten from "lodash.flatten"
import uniqBy from "lodash.uniqby"
import { DeploymentGroupConfig, DeploymentStatus } from "../../model"
import { confirmOperation } from "./confirm"
import { DeploymentTargetsOperationOutput, InitialHolder } from "./model"

export const planDeployment = async (
  holder: InitialHolder,
): Promise<DeploymentTargetsOperationOutput> => {
  const {
    ctx,
    io,
    watch,
    input: { groups, targets },
  } = holder

  if (groups.length > 0) {
    groups.forEach((groupPath) => {
      if (!ctx.hasDeploymentGroup(groupPath)) {
        throw new TakomoError(`Deployment group '${groupPath}' not found`)
      }
    })
  }

  const deploymentGroupsToLaunch =
    groups.length === 0
      ? ctx.getRootDeploymentGroups()
      : groups.reduce((collected, path) => {
          return [...collected, ctx.getDeploymentGroup(path)]
        }, new Array<DeploymentGroupConfig>())

  const sortGroups = (
    a: DeploymentGroupConfig,
    b: DeploymentGroupConfig,
  ): number => {
    const order = a.priority - b.priority
    return order !== 0 ? order : a.name.localeCompare(b.name)
  }

  const groupsToLaunch: DeploymentGroupConfig[] = flatten(
    deploymentGroupsToLaunch.map((ou) =>
      flatten(
        collectFromHierarchy(ou, (o) => o.children, {
          sortSiblings: sortGroups,
          filter: (o) => o.status === DeploymentStatus.ACTIVE,
        }),
      ),
    ),
  )

  const uniqueGroupsToLaunch = uniqBy(groupsToLaunch, (o) => o.path).filter(
    (o) => o.status === DeploymentStatus.ACTIVE,
  )

  const grs = uniqueGroupsToLaunch
    .map((ou) => {
      return {
        ...ou,
        targets: ou.targets.filter(
          (a) =>
            a.status === DeploymentStatus.ACTIVE &&
            a.configSets.length > 0 &&
            (targets.length === 0 || targets.includes(a.name)),
        ),
      }
    })
    .filter((ou) => ou.targets.length > 0)

  const hasChanges = grs.length > 0

  if (!hasChanges) {
    io.info("No targets to deploy")
    return {
      results: [],
      watch: watch.stop(),
      success: true,
      status: CommandStatus.SKIPPED,
      message: "No targets to deploy",
    }
  }

  const plan = {
    groups: grs,
    hasChanges,
  }

  return confirmOperation({
    ...holder,
    plan,
  })
}
