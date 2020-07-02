import { ConfigSetName, parseConfigSets } from "@takomo/config-sets"
import { Options, parseCommandRole, parseVars } from "@takomo/core"
import {
  Logger,
  parseYaml,
  readFileContents,
  renderTemplate,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import uniq from "lodash.uniq"
import {
  DeploymentConfigFile,
  DeploymentGroupConfig,
  DeploymentGroupPath,
  DeploymentStatus,
  DeploymentTargetConfig,
} from "../model"
import { deploymentGroupsConfigFileSchema } from "./schema"

const parseDeploymentStatus = (value: any): DeploymentStatus => {
  switch (value) {
    case "active":
      return DeploymentStatus.ACTIVE
    case "disabled":
      return DeploymentStatus.DISABLED
    default:
      return DeploymentStatus.ACTIVE
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
): DeploymentTargetConfig => {
  const configuredConfigSets = value.configSets || []
  const configSets = uniq([...inheritedConfigSets, ...configuredConfigSets])

  return {
    configSets,
    name: value.name || null,
    description: value.description || null,
    accountId: value.accountId || null,
    deploymentRole: parseCommandRole(value.deploymentRole),
    status: parseDeploymentStatus(value.status),
    vars: parseVars(value.vars),
  }
}

const parseDeploymentTargets = (
  value: any,
  inheritedConfigSets: ConfigSetName[],
): DeploymentTargetConfig[] => {
  if (value === null || value === undefined) {
    return []
  }

  return value.map((target: any) =>
    parseDeploymentTarget(target, inheritedConfigSets),
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
  groupPath: DeploymentGroupPath,
  config: any,
  inheritedConfigSets: ConfigSetName[],
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

  const children = [
    ...missingDirectChildPaths,
    ...directChildPaths,
  ].map((childPath) => parseDeploymentGroup(childPath, config, configSets))

  const targets = parseDeploymentTargets(group?.targets, configSets)
  const name = groupPath.split("/").reverse()[0]

  return {
    name,
    children,
    targets,
    configSets,
    deploymentRole: parseCommandRole(group?.deploymentRole || null),
    path: groupPath,
    description: group?.description || null,
    priority: group?.priority || 0,
    vars: parseVars(group?.vars),
    status: parseDeploymentStatus(group?.status),
  }
}

const parseDeploymentGroups = (value: any): DeploymentGroupConfig[] => {
  if (value === null || value === undefined) {
    return []
  }

  return Object.keys(value).map((rootPath) =>
    parseDeploymentGroup(rootPath, value, []),
  )
}

export const parseDeploymentConfigFile = async (
  logger: Logger,
  options: Options,
  variables: any,
  path: string,
  templateEngine: TemplateEngine,
): Promise<DeploymentConfigFile> => {
  const logConfidentialInfo = options.isConfidentialInfoLoggingEnabled()
  const contents = await readFileContents(path)

  const filterFn = logConfidentialInfo
    ? (obj: any) => obj
    : (obj: any) => {
        return {
          ...obj,
          env: "<concealed>",
        }
      }

  logger.traceText(`Raw deployment groups config file:`, contents)
  logger.traceObject(
    `Render deployment groups config file using variables:`,
    variables,
    filterFn,
  )

  const rendered = await renderTemplate(
    templateEngine,
    path,
    contents,
    variables,
  )

  logger.traceText(`Final rendered deployment groups config file:`, rendered)

  const parsedFile = (await parseYaml(path, rendered)) || {}

  const { error } = deploymentGroupsConfigFileSchema.validate(parsedFile, {
    abortEarly: false,
  })

  if (error) {
    const details = error.details.map((d) => `  - ${d.message}`).join("\n")
    throw new TakomoError(
      `${error.details.length} validation error(s) in deployment groups config file ${path}:\n\n${details}`,
    )
  }

  const vars = parseVars(parsedFile.vars)
  const configSets = parseConfigSets(parsedFile.configSets)
  const deploymentGroups = parseDeploymentGroups(parsedFile.deploymentGroups)

  return {
    vars,
    configSets,
    deploymentGroups,
  }
}
