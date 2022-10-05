import R from "ramda"
import { DeploymentTargetConfigItem } from "../../takomo-deployment-targets-repository"
import { merge, mergeArrays } from "../../takomo-util"

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
    bootstrapConfigSets: mergeArrays({
      first: first.bootstrapConfigSets ?? [],
      second: second.bootstrapConfigSets ?? [],
    }),
    status: second.status ?? first.status,
    deploymentRoleName: second.deploymentRoleName ?? first.deploymentRoleName,
    deploymentRole: second.deploymentRole ?? first.deploymentRole,
    description: second.description ?? first.description,
    bootstrapRoleName: second.bootstrapRoleName ?? first.bootstrapRoleName,
    bootstrapRole: second.bootstrapRole ?? first.bootstrapRole,
  }

  return mergeDeploymentTargetConfigsInternal([merged, ...rest])
}

export const mergeDeploymentTargetConfigs = (
  items: ReadonlyArray<DeploymentTargetConfigItem>,
): ReadonlyArray<DeploymentTargetConfigItem> => {
  const itemsByName = R.groupBy(R.prop("name"), items)
  return Array.from(Object.values(itemsByName)).map(
    mergeDeploymentTargetConfigsInternal,
  )
}
