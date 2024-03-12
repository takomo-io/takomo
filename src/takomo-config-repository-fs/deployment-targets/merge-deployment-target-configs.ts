import _ from "lodash"
import { DeploymentTargetConfigItem } from "../../takomo-deployment-targets-repository/index.js"
import { mergeArrays } from "../../utils/collections.js"
import { merge } from "../../utils/objects.js"

const mergeDeploymentTargetConfigsInternal = ([
  first,
  second,
  ...rest
]: ReadonlyArray<DeploymentTargetConfigItem>): DeploymentTargetConfigItem => {
  if (!second) {
    return first
  }

  const merged: DeploymentTargetConfigItem = {
    name: second.name,
    accountId: second.accountId ?? first.accountId,
    configSets: mergeArrays({
      first: first.configSets ?? [],
      second: second.configSets ?? [],
    }),
    vars: merge(first.vars ?? {}, second.vars ?? {}),
    deploymentGroupPath: second.deploymentGroupPath,
    labels: mergeArrays({
      first: first.labels ?? [],
      second: second.labels ?? [],
    }),
    status: second.status ?? first.status,
    deploymentRoleName: second.deploymentRoleName ?? first.deploymentRoleName,
    deploymentRole: second.deploymentRole ?? first.deploymentRole,
    description: second.description ?? first.description,
  }

  return mergeDeploymentTargetConfigsInternal([merged, ...rest])
}

export const mergeDeploymentTargetConfigs = (
  items: ReadonlyArray<DeploymentTargetConfigItem>,
): ReadonlyArray<DeploymentTargetConfigItem> => {
  const itemsByName = _.groupBy(items, "name")
  return Array.from(Object.values(itemsByName)).map(
    mergeDeploymentTargetConfigsInternal,
  )
}
