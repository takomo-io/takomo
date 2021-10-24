import { IamRoleName } from "@takomo/aws-model"
import {
  ConfigSetInstruction,
  mergeConfigSetInstructions,
  parseConfigSetInstructions,
} from "@takomo/config-sets"
import {
  CommandRole,
  parseCommandRole,
  parseStringArray,
  parseVars,
  Vars,
} from "@takomo/core"
import { DeploymentTargetConfig } from "@takomo/deployment-targets-config"
import { Label } from "@takomo/deployment-targets-model"
import { deepCopy } from "@takomo/util"
import R from "ramda"
import { parseDeploymentStatus } from "./parse-deployment-status"

const parseDeploymentTarget = (
  value: any,
  inheritedVars: Vars,
  inheritedConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedLabels: ReadonlyArray<Label>,
  inheritedDeploymentRole: CommandRole | undefined,
  inheritedDeploymentRoleName: IamRoleName | undefined,
  inheritedBootstrapRole: CommandRole | undefined,
  inheritedBootstrapRoleName: IamRoleName | undefined,
): DeploymentTargetConfig => {
  const configuredConfigSets = parseConfigSetInstructions(value.configSets)
  const configSets = mergeConfigSetInstructions(
    configuredConfigSets,
    inheritedConfigSets,
  )

  const configuredBootstrapConfigSets = parseConfigSetInstructions(
    value.bootstrapConfigSets,
  )
  const bootstrapConfigSets = mergeConfigSetInstructions(
    configuredBootstrapConfigSets,
    inheritedBootstrapConfigSets,
  )

  const configuredLabels = parseStringArray(value.labels)
  const labels = R.uniq([...inheritedLabels, ...configuredLabels])
  const vars = deepCopy({ ...inheritedVars, ...parseVars(value.vars) })

  const deploymentRole =
    parseCommandRole(value.deploymentRole) ?? inheritedDeploymentRole
  const bootstrapRole =
    parseCommandRole(value.bootstrapRole) ?? inheritedBootstrapRole
  const deploymentRoleName =
    value.deploymentRoleName ?? inheritedDeploymentRoleName
  const bootstrapRoleName =
    value.bootstrapRoleName ?? inheritedBootstrapRoleName

  return {
    configSets,
    bootstrapConfigSets,
    labels,
    vars,
    name: value.name,
    description: value.description,
    accountId: value.accountId,
    deploymentRole,
    bootstrapRole,
    deploymentRoleName,
    bootstrapRoleName,
    status: parseDeploymentStatus(value.status),
  }
}

export const parseDeploymentTargets = (
  value: any,
  inheritedVars: Vars,
  inheritedConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedLabels: ReadonlyArray<Label>,
  inheritedDeploymentRole: CommandRole | undefined,
  inheritedDeploymentRoleName: IamRoleName | undefined,
  inheritedBootstrapRole: CommandRole | undefined,
  inheritedBootstrapRoleName: IamRoleName | undefined,
): ReadonlyArray<DeploymentTargetConfig> => {
  if (value === null || value === undefined) {
    return []
  }

  return value
    .map((target: any) =>
      parseDeploymentTarget(
        target,
        inheritedVars,
        inheritedConfigSets,
        inheritedBootstrapConfigSets,
        inheritedLabels,
        inheritedDeploymentRole,
        inheritedDeploymentRoleName,
        inheritedBootstrapRole,
        inheritedBootstrapRoleName,
      ),
    )
    .sort((a: DeploymentTargetConfig, b: DeploymentTargetConfig) =>
      a.name.localeCompare(b.name),
    )
}
