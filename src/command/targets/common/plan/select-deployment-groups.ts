import * as R from "ramda"
import { ConfigSetName } from "../../../../config-sets/config-set-model.js"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "../../../../config/targets-config.js"
import { DeploymentTargetsContext } from "../../../../context/targets-context.js"
import {
  DeploymentGroupPath,
  DeploymentTargetNamePattern,
  Label,
} from "../../../../targets/targets-model.js"
import { collectFromHierarchy } from "../../../../utils/collections.js"
import { TakomoError } from "../../../../utils/errors.js"
import { CommandPath } from "../../../command-model.js"
import { createDeploymentTargetNamePatternMatcher } from "./create-deployment-target-name-pattern-matcher.js"

export interface SelectDeploymentGroupsProps {
  readonly groups: ReadonlyArray<DeploymentGroupPath>
  readonly targets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly excludeTargets: ReadonlyArray<DeploymentTargetNamePattern>
  readonly labels: ReadonlyArray<Label>
  readonly excludeLabels: ReadonlyArray<Label>
  readonly configSetName?: ConfigSetName
  readonly commandPath?: CommandPath
}

const sortGroups = (
  a: DeploymentGroupConfig,
  b: DeploymentGroupConfig,
): number => {
  const order = a.priority - b.priority
  return order !== 0 ? order : a.name.localeCompare(b.name)
}

export const selectDeploymentGroups = (
  ctx: DeploymentTargetsContext,
  props: SelectDeploymentGroupsProps,
): ReadonlyArray<DeploymentGroupConfig> => {
  const {
    configSetName,
    commandPath,
    groups,
    targets,
    excludeTargets,
    labels,
    excludeLabels,
  } = props

  if (groups.length > 0) {
    groups.forEach((groupPath) => {
      if (!ctx.hasDeploymentGroup(groupPath)) {
        throw new TakomoError(`Deployment group '${groupPath}' not found`)
      }
    })
  }

  if (commandPath && !configSetName) {
    throw new TakomoError(
      "If you provide command path, you must provide config set, too",
    )
  }

  if (configSetName) {
    if (!ctx.hasConfigSet(configSetName)) {
      throw new TakomoError(`Config set '${configSetName}' not found`)
    }
  }

  const rootGroups =
    groups.length === 0
      ? ctx.rootDeploymentGroups
      : groups.reduce(
          (collected, path) => [...collected, ctx.getDeploymentGroup(path)],
          new Array<DeploymentGroupConfig>(),
        )

  const flattenedGroups = rootGroups
    .map((group) =>
      collectFromHierarchy(group, (o) => o.children, {
        sortSiblings: sortGroups,
        filter: (o) => o.status === "active",
      }),
    )
    .flat()

  const uniqueGroups = R.uniqBy(R.prop("path"), flattenedGroups).filter(
    (group) => group.status === "active",
  )

  const configSetsMatch = (a: DeploymentTargetConfig): boolean => {
    // if (!configSetType) {
    //   return true
    // }
    //
    // const configSets = getConfigSetsByType(configSetType, a)
    // if (configSets.length === 0) {
    //   return false
    // }

    if (configSetName) {
      if (!a.configSets.some(({ name }) => name === configSetName)) {
        return false
      }
    }

    return true
  }

  const isActive = ({ status }: DeploymentTargetConfig): boolean =>
    status === "active"

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

  const filterTargetsBySelectionCriteria = (
    targets: ReadonlyArray<DeploymentTargetConfig>,
  ): ReadonlyArray<DeploymentTargetConfig> =>
    targets.filter(
      (target) =>
        isActive(target) &&
        configSetsMatch(target) &&
        targetNameMatches(target) &&
        labelMatches(target),
    )

  return uniqueGroups
    .map((group) => ({
      ...group,
      targets: filterTargetsBySelectionCriteria(group.targets),
    }))
    .filter(({ targets }) => targets.length > 0)
}
