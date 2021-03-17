import { ConfigSetName, parseConfigSets } from "@takomo/config-sets"
import { CommandContext, parseCommandRole, parseVars } from "@takomo/core"
import {
  DeploymentGroupPath,
  DeploymentStatus,
} from "@takomo/deployment-targets-model"
import { deepFreeze, ValidationError } from "@takomo/util"
import uniq from "lodash.uniq"
import { err, ok, Result } from "neverthrow"
import {
  DeploymentConfig,
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "./model"
import { createDeploymentTargetsConfigSchema } from "./schema"

const parseDeploymentStatus = (value: any): DeploymentStatus => {
  if (!value) {
    return "active"
  }

  switch (value) {
    case "active":
      return "active"
    case "disabled":
      return "disabled"
    default:
      throw new Error(`Unsupported deployment status: '${value}'`)
  }
}

const parseConfigSetNames = (value: any): ConfigSetName[] => {
  if (value === null || value === undefined) {
    return []
  }

  if (typeof value === "string") {
    return [value]
  }

  return value
}

const parseDeploymentTarget = (
  value: any,
  inheritedConfigSets: ConfigSetName[],
  inheritedBootstrapConfigSets: ConfigSetName[],
): DeploymentTargetConfig => {
  const configuredConfigSets = parseConfigSetNames(value.configSets)
  const configSets = uniq([...inheritedConfigSets, ...configuredConfigSets])

  const configuredBootstrapConfigSets = parseConfigSetNames(
    value.bootstrapConfigSets,
  )
  const bootstrapConfigSets = uniq([
    ...inheritedBootstrapConfigSets,
    ...configuredBootstrapConfigSets,
  ])

  console.log(JSON.stringify(value, undefined, 2))

  return {
    configSets,
    bootstrapConfigSets,
    name: value.name || null,
    description: value.description || null,
    accountId: value.accountId || null,
    deploymentRole: parseCommandRole(value.deploymentRole),
    bootstrapRole: parseCommandRole(value.bootstrapRole),
    status: parseDeploymentStatus(value.status),
    vars: parseVars(value.vars),
  }
}

const parseDeploymentTargets = (
  value: any,
  inheritedConfigSets: ConfigSetName[],
  inheritedBootstrapConfigSets: ConfigSetName[],
): DeploymentTargetConfig[] => {
  if (value === null || value === undefined) {
    return []
  }

  return value.map((target: any) =>
    parseDeploymentTarget(
      target,
      inheritedConfigSets,
      inheritedBootstrapConfigSets,
    ),
  )
}

const findMissingDirectChildrenPaths = (
  childPaths: string[],
  depth: number,
): string[] => {
  return uniq(
    childPaths
      .filter((key) => key.split("/").length >= depth + 2)
      .map((key) =>
        key
          .split("/")
          .slice(0, depth + 1)
          .join("/"),
      )
      .filter((key) => !childPaths.includes(key)),
  )
}

const parseDeploymentGroup = (
  externalDeploymentTargets: Map<DeploymentGroupPath, ReadonlyArray<unknown>>,
  groupPath: DeploymentGroupPath,
  config: any,
  inheritedConfigSets: ConfigSetName[],
  inheritedBootstrapConfigSets: ConfigSetName[],
): DeploymentGroupConfig => {
  const group = config[groupPath]
  const groupPathDepth = groupPath.split("/").length

  const childPaths = Object.keys(config).filter((key) =>
    key.startsWith(`${groupPath}/`),
  )

  const directChildPaths = childPaths.filter(
    (key) => key.split("/").length === groupPathDepth + 1,
  )

  const missingDirectChildPaths = findMissingDirectChildrenPaths(
    childPaths,
    groupPathDepth,
  )

  const configuredConfigSets = parseConfigSetNames(group?.configSets)
  const configSets = uniq([...inheritedConfigSets, ...configuredConfigSets])

  const configuredBootstrapConfigSets = parseConfigSetNames(
    group?.bootstrapConfigSets,
  )
  const bootstrapConfigSets = uniq([
    ...inheritedBootstrapConfigSets,
    ...configuredBootstrapConfigSets,
  ])

  const children = [
    ...missingDirectChildPaths,
    ...directChildPaths,
  ].map((childPath) =>
    parseDeploymentGroup(
      externalDeploymentTargets,
      childPath,
      config,
      configSets,
      bootstrapConfigSets,
    ),
  )

  const externalTargets = externalDeploymentTargets.get(groupPath) ?? []
  const allTargets = [...(group?.targets ?? []), ...externalTargets]

  const targets = parseDeploymentTargets(
    allTargets,
    configSets,
    bootstrapConfigSets,
  )
  const name = groupPath.split("/").reverse()[0]

  return {
    name,
    children,
    targets,
    configSets,
    bootstrapConfigSets,
    deploymentRole: parseCommandRole(group?.deploymentRole ?? null),
    bootstrapRole: parseCommandRole(group?.bootstrapRole ?? null),
    path: groupPath,
    description: group?.description || null,
    priority: group?.priority || 0,
    vars: parseVars(group?.vars),
    status: parseDeploymentStatus(group?.status),
  }
}

const parseDeploymentGroups = (
  externalDeploymentTargets: Map<DeploymentGroupPath, ReadonlyArray<unknown>>,
  value: any,
): DeploymentGroupConfig[] => {
  if (value === null || value === undefined) {
    return []
  }

  return Object.keys(value).map((rootPath) =>
    parseDeploymentGroup(externalDeploymentTargets, rootPath, value, [], []),
  )
}

export const buildDeploymentConfig = (
  ctx: CommandContext,
  externalDeploymentTargets: Map<DeploymentGroupPath, ReadonlyArray<unknown>>,
  record: Record<string, unknown>,
): Result<DeploymentConfig, ValidationError> => {
  const { error } = createDeploymentTargetsConfigSchema({
    regions: ctx.regions,
  }).validate(record, {
    abortEarly: false,
  })

  if (error) {
    const details = error.details.map((d) => d.message)
    return err(
      new ValidationError(
        "Validation errors in deployment configuration",
        details,
      ),
    )
  }

  const vars = parseVars(record.vars)
  const configSets = parseConfigSets(record.configSets)
  const deploymentGroups = parseDeploymentGroups(
    externalDeploymentTargets,
    record.deploymentGroups,
  )

  return ok(
    deepFreeze({
      vars,
      configSets,
      deploymentGroups,
    }),
  )
}
