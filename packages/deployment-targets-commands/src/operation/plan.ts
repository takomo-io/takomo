import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "@takomo/deployment-targets-config"
import { DeploymentTargetNamePattern } from "@takomo/deployment-targets-model"
import { collectFromHierarchy, TakomoError } from "@takomo/util"
import R from "ramda"
import { confirmOperation } from "./confirm"
import { DeploymentTargetsOperationOutput, InitialHolder } from "./model"

type Matcher = (targetName: DeploymentTargetConfig) => boolean

export const createDeploymentTargetNamePatternMatcher = (
  pattern: DeploymentTargetNamePattern,
): Matcher => {
  const prefix = pattern.endsWith("%")
  const suffix = pattern.startsWith("%")
  if (prefix && suffix) {
    const part = pattern.slice(1, -1)
    return ({ name }) => name.includes(part)
  }
  if (prefix) {
    const part = pattern.slice(0, -1)
    return ({ name }) => name.startsWith(part)
  }
  if (suffix) {
    const part = pattern.slice(1)
    return ({ name }) => name.endsWith(part)
  }
  return ({ name }) => name === pattern
}

/**
 * @hidden
 */
export const planDeployment = async (
  holder: InitialHolder,
): Promise<DeploymentTargetsOperationOutput> => {
  const {
    ctx,
    io,
    timer,
    input: { groups, targets, labels, configSetType },
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
      ? ctx.rootDeploymentGroups
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

  const groupsToLaunch: DeploymentGroupConfig[] = deploymentGroupsToLaunch
    .map((ou) =>
      collectFromHierarchy(ou, (o) => o.children, {
        sortSiblings: sortGroups,
        filter: (o) => o.status === "active",
      }),
    )
    .flat()

  const uniqueGroupsToLaunch = R.uniqBy(R.prop("path"), groupsToLaunch).filter(
    (o) => o.status === "active",
  )

  const hasConfigSets = (target: DeploymentTargetConfig): boolean => {
    switch (configSetType) {
      case "standard":
        return target.configSets.length > 0
      case "bootstrap":
        return target.bootstrapConfigSets.length > 0
      default:
        throw new Error(`Unsupported config set type: ${configSetType}`)
    }
  }

  const targetNameMatchers = targets.map(
    createDeploymentTargetNamePatternMatcher,
  )

  const targetNameMatches = (target: DeploymentTargetConfig): boolean =>
    targetNameMatchers.length === 0 || targetNameMatchers.some((m) => m(target))

  const labelMatches = (target: DeploymentTargetConfig): boolean =>
    labels.length === 0 || target.labels.some((l) => labels.includes(l))

  const grs = uniqueGroupsToLaunch
    .map((ou) => {
      return {
        ...ou,
        targets: ou.targets.filter(
          (a) =>
            a.status === "active" &&
            hasConfigSets(a) &&
            targetNameMatches(a) &&
            labelMatches(a),
        ),
      }
    })
    .filter((ou) => ou.targets.length > 0)

  const hasChanges = grs.length > 0

  if (!hasChanges) {
    timer.stop()
    io.info("No targets to deploy")
    return {
      results: [],
      timer,
      success: true,
      status: "SKIPPED",
      message: "No targets to deploy",
    }
  }

  const selectedTargets = grs.map((g) => g.targets).flat()

  const plan = {
    groups: grs,
    hasChanges,
  }

  const listener = io.createDeploymentTargetsListener(selectedTargets.length)

  return confirmOperation({
    ...holder,
    plan,
    listener,
  })
}
