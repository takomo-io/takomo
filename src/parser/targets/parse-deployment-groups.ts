import R from "ramda"
import { IamRoleName } from "../../aws/common/model"
import { Vars } from "../../common/model"
import { ConfigSetInstruction } from "../../config-sets/config-set-model"
import { DeploymentGroupConfig } from "../../config/targets-config"
import { CommandRole } from "../../takomo-core/command"
import { DeploymentGroupPath, Label } from "../../targets/targets-model"
import { merge } from "../../utils/objects"
import { parseCommandRole, parseStringArray, parseVars } from "../common-parser"
import {
  mergeConfigSetInstructions,
  parseConfigSetInstructions,
} from "../config-set-parser"
import { parseDeploymentStatus } from "./parse-deployment-status"
import { parseDeploymentTargets } from "./parse-deployment-targets"
import { parseTargetSchemas } from "./parse-target-schemas"
import { fillMissingDeploymentGroups } from "./util"

const parseDeploymentGroup = (
  externalDeploymentTargets: Map<DeploymentGroupPath, ReadonlyArray<unknown>>,
  groupPath: DeploymentGroupPath,
  config: any,
  inheritedVars: Vars,
  inheritedConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetInstruction>,
  inheritedLabels: ReadonlyArray<Label>,
  inheritedDeploymentRole: CommandRole | undefined,
  inheritedDeploymentRoleName: IamRoleName | undefined,
  inheritedBootstrapRole: CommandRole | undefined,
  inheritedBootstrapRoleName: IamRoleName | undefined,
): DeploymentGroupConfig => {
  const group = config[groupPath]
  const groupPathDepth = groupPath.split("/").length

  const childPaths = Object.keys(config).filter((key) =>
    key.startsWith(`${groupPath}/`),
  )

  const directChildPaths = childPaths.filter(
    (key) => key.split("/").length === groupPathDepth + 1,
  )

  const configuredConfigSets = parseConfigSetInstructions(group.configSets)
  const configSets = mergeConfigSetInstructions(
    configuredConfigSets,
    inheritedConfigSets,
  )

  const configuredBootstrapConfigSets = parseConfigSetInstructions(
    group.bootstrapConfigSets,
  )
  const bootstrapConfigSets = mergeConfigSetInstructions(
    configuredBootstrapConfigSets,
    inheritedBootstrapConfigSets,
  )

  const configuredLabels = parseStringArray(group?.labels)
  const labels = R.uniq([...inheritedLabels, ...configuredLabels])

  const targetsSchema = parseTargetSchemas(group?.targetsSchema)
  const vars = merge(inheritedVars, parseVars(group?.vars))

  const deploymentRole =
    parseCommandRole(group?.deploymentRole) ?? inheritedDeploymentRole
  const deploymentRoleName =
    group?.deploymentRoleName ?? inheritedDeploymentRoleName
  const bootstrapRole =
    parseCommandRole(group?.bootstrapRole) ?? inheritedBootstrapRole
  const bootstrapRoleName =
    group?.bootstrapRoleName ?? inheritedBootstrapRoleName

  const children = directChildPaths.map((childPath) =>
    parseDeploymentGroup(
      externalDeploymentTargets,
      childPath,
      config,
      vars,
      configSets,
      bootstrapConfigSets,
      labels,
      deploymentRole,
      deploymentRoleName,
      bootstrapRole,
      bootstrapRoleName,
    ),
  )

  const externalTargets = externalDeploymentTargets.get(groupPath) ?? []
  const allTargets = [...(group?.targets ?? []), ...externalTargets]

  const targets = parseDeploymentTargets(
    allTargets,
    vars,
    configSets,
    bootstrapConfigSets,
    labels,
    deploymentRole,
    deploymentRoleName,
    bootstrapRole,
    bootstrapRoleName,
  )
  const name = groupPath.split("/").reverse()[0]

  return {
    name,
    children,
    targets,
    configSets,
    bootstrapConfigSets,
    labels,
    targetsSchema,
    vars,
    deploymentRole,
    bootstrapRole,
    deploymentRoleName,
    bootstrapRoleName,
    path: groupPath,
    description: group?.description,
    priority: group?.priority ?? 0,
    status: parseDeploymentStatus(group?.status),
  }
}

export const parseDeploymentGroups = (
  externalDeploymentTargets: Map<DeploymentGroupPath, ReadonlyArray<unknown>>,
  value: any,
  inheritedVars: Vars,
  inheritedDeploymentRole: CommandRole | undefined,
  inheritedDeploymentRoleName: IamRoleName | undefined,
  inheritedBootstrapRole: CommandRole | undefined,
  inheritedBootstrapRoleName: IamRoleName | undefined,
): DeploymentGroupConfig[] => {
  if (value === null || value === undefined) {
    return []
  }

  const filledValue = fillMissingDeploymentGroups(value)
  const rootGroupPaths = R.uniq(
    Object.keys(filledValue).map((key) => key.split("/")[0]),
  )

  return rootGroupPaths.map((rootPath) =>
    parseDeploymentGroup(
      externalDeploymentTargets,
      rootPath,
      filledValue,
      inheritedVars,
      [],
      [],
      [],
      inheritedDeploymentRole,
      inheritedDeploymentRoleName,
      inheritedBootstrapRole,
      inheritedBootstrapRoleName,
    ),
  )
}
