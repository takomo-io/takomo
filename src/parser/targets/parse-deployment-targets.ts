import * as R from "ramda"
import { IamRoleName } from "../../aws/common/model.js"
import { Vars } from "../../common/model.js"
import { ConfigSetInstruction } from "../../config-sets/config-set-model.js"
import { DeploymentTargetConfig } from "../../config/targets-config.js"
import { CommandRole } from "../../takomo-core/command.js"
import { Label } from "../../targets/targets-model.js"
import { merge } from "../../utils/objects.js"
import {
  parseCommandRole,
  parseStringArray,
  parseVars,
} from "../common-parser.js"
import {
  mergeConfigSetInstructions,
  parseConfigSetInstructions,
} from "../config-set-parser.js"
import { parseDeploymentStatus } from "./parse-deployment-status.js"

export const parseDeploymentTarget = (
  value: any,
  inheritedVars: Vars,
  inheritedConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedLabels: ReadonlyArray<Label>,
  inheritedDeploymentRole: CommandRole | undefined,
  inheritedDeploymentRoleName: IamRoleName | undefined,
): DeploymentTargetConfig => {
  const configuredConfigSets = parseConfigSetInstructions(value.configSets)
  const configSets = mergeConfigSetInstructions(
    configuredConfigSets,
    inheritedConfigSets,
  )

  const configuredLabels = parseStringArray(value.labels)
  const labels = R.uniq([...inheritedLabels, ...configuredLabels])
  const vars = merge(inheritedVars, parseVars(value.vars))

  const deploymentRole =
    parseCommandRole(value.deploymentRole) ?? inheritedDeploymentRole
  const deploymentRoleName =
    value.deploymentRoleName ?? inheritedDeploymentRoleName

  return {
    configSets,
    labels,
    vars,
    name: value.name,
    description: value.description,
    accountId: value.accountId,
    deploymentRole,
    deploymentRoleName,
    status: parseDeploymentStatus(value.status),
  }
}

export const parseDeploymentTargets = (
  value: any,
  inheritedVars: Vars,
  inheritedConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedLabels: ReadonlyArray<Label>,
  inheritedDeploymentRole: CommandRole | undefined,
  inheritedDeploymentRoleName: IamRoleName | undefined,
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
        inheritedLabels,
        inheritedDeploymentRole,
        inheritedDeploymentRoleName,
      ),
    )
    .sort((a: DeploymentTargetConfig, b: DeploymentTargetConfig) =>
      a.name.localeCompare(b.name),
    )
}
