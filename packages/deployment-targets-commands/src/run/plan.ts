import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "@takomo/deployment-targets-config"
import { DeploymentTargetsContext } from "@takomo/deployment-targets-context"
import { collectFromHierarchy, TakomoError } from "@takomo/util"
import R from "ramda"
import { createDeploymentTargetNamePatternMatcher } from "../operation/plan"
import { confirmRun } from "./confirm"
import {
  DeploymentTargetsRunInput,
  DeploymentTargetsRunIO,
  DeploymentTargetsRunOutput,
} from "./model"

interface PlanRunProps {
  readonly ctx: DeploymentTargetsContext
  readonly input: DeploymentTargetsRunInput
  readonly io: DeploymentTargetsRunIO
}

export const planRun = async ({
  ctx,
  input,
  io,
}: PlanRunProps): Promise<DeploymentTargetsRunOutput> => {
  const {
    groups,
    targets,
    excludeTargets,
    labels,
    excludeLabels,
    timer,
  } = input

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

  const targetNameMatchers = targets.map(
    createDeploymentTargetNamePatternMatcher,
  )

  const excludeTargetNameMatchers = excludeTargets.map(
    createDeploymentTargetNamePatternMatcher,
  )

  const targetNameMatches = (target: DeploymentTargetConfig): boolean =>
    (targetNameMatchers.length === 0 ||
      targetNameMatchers.some((m) => m(target))) &&
    (excludeTargetNameMatchers.length === 0 ||
      !excludeTargetNameMatchers.some((m) => m(target)))

  const labelMatches = (target: DeploymentTargetConfig): boolean =>
    (labels.length === 0 || target.labels.some((l) => labels.includes(l))) &&
    (excludeLabels.length === 0 ||
      !target.labels.some((l) => excludeLabels.includes(l)))

  const grs = uniqueGroupsToLaunch
    .map((ou) => {
      return {
        ...ou,
        targets: ou.targets.filter(
          (a) =>
            a.status === "active" && targetNameMatches(a) && labelMatches(a),
        ),
      }
    })
    .filter((ou) => ou.targets.length > 0)

  const selectedTargets = grs.map((g) => g.targets).flat()

  if (selectedTargets.length === 0) {
    timer.stop()

    return {
      timer,
      success: true,
      status: "SKIPPED",
      message: "No targets",
      result: undefined,
      outputFormat: input.outputFormat,
    }
  }

  const listener = io.createDeploymentTargetsListener(selectedTargets.length)

  const plan = {
    groups: grs,
  }

  return confirmRun({ plan, io, ctx, input, listener })
}
