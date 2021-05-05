import {
  ConfigSet,
  ConfigSetName,
  mergeConfigSets,
  parseConfigSets,
} from "@takomo/config-sets"
import { CommandContext, parseCommandRole, parseVars, Vars } from "@takomo/core"
import {
  DeploymentGroupPath,
  DeploymentStatus,
  DeploymentTargetsSchemaRegistry,
  Label,
} from "@takomo/deployment-targets-model"
import {
  collectFromHierarchy,
  deepCopy,
  deepFreeze,
  TkmLogger,
  ValidationError,
} from "@takomo/util"
import { err, ok, Result } from "neverthrow"
import R from "ramda"
import {
  DeploymentConfig,
  DeploymentGroupConfig,
  DeploymentTargetConfig,
  SchemaConfig,
} from "./model"
import { createDeploymentTargetsConfigSchema } from "./schema"

export const fillMissingDeploymentGroups = (
  value: Record<string, unknown>,
): Record<string, unknown> => {
  for (const key of Object.keys(value)) {
    const parts = key.split("/")
    for (let i = 1; i <= parts.length; i++) {
      const subKey = parts.slice(0, i).join("/")
      if (!(subKey in value)) {
        value[subKey] = {}
      }
    }
  }

  return value
}

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

const parseTargetSchema = (value: unknown): SchemaConfig => {
  if (typeof value === "string") {
    return {
      name: value,
    }
  }

  if (typeof value === "object") {
    return value as SchemaConfig
  }

  throw new Error(`Expected schema to be of type string or object`)
}

const parseTargetSchemas = (value: unknown): ReadonlyArray<SchemaConfig> => {
  if (value === undefined || value === null) {
    return []
  }

  return Array.isArray(value)
    ? value.map(parseTargetSchema)
    : [parseTargetSchema(value)]
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

const parseLabels = (value: any): ReadonlyArray<Label> => {
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
  inheritedVars: Vars,
  inheritedConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedLabels: ReadonlyArray<Label>,
): DeploymentTargetConfig => {
  const configuredConfigSets = parseConfigSetNames(value.configSets)
  const configSets = R.uniq([...inheritedConfigSets, ...configuredConfigSets])

  const configuredBootstrapConfigSets = parseConfigSetNames(
    value.bootstrapConfigSets,
  )
  const bootstrapConfigSets = R.uniq([
    ...inheritedBootstrapConfigSets,
    ...configuredBootstrapConfigSets,
  ])

  const configuredLabels = parseConfigSetNames(value.labels)
  const labels = R.uniq([...inheritedLabels, ...configuredLabels])
  const vars = deepCopy({ ...inheritedVars, ...parseVars(value.vars) })

  return {
    configSets,
    bootstrapConfigSets,
    labels,
    vars,
    name: value.name,
    description: value.description,
    accountId: value.accountId,
    deploymentRole: parseCommandRole(value.deploymentRole),
    bootstrapRole: parseCommandRole(value.bootstrapRole),
    deploymentRoleName: value.deploymentRoleName,
    bootstrapRoleName: value.bootstrapRoleName,
    status: parseDeploymentStatus(value.status),
  }
}

const parseDeploymentTargets = (
  value: any,
  inheritedVars: Vars,
  inheritedConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedLabels: ReadonlyArray<Label>,
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
      ),
    )
    .sort((a: DeploymentTargetConfig, b: DeploymentTargetConfig) =>
      a.name.localeCompare(b.name),
    )
}

const parseDeploymentGroup = (
  externalDeploymentTargets: Map<DeploymentGroupPath, ReadonlyArray<unknown>>,
  groupPath: DeploymentGroupPath,
  config: any,
  inheritedVars: Vars,
  inheritedConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedBootstrapConfigSets: ReadonlyArray<ConfigSetName>,
  inheritedLabels: ReadonlyArray<Label>,
): DeploymentGroupConfig => {
  const group = config[groupPath]
  const groupPathDepth = groupPath.split("/").length

  const childPaths = Object.keys(config).filter((key) =>
    key.startsWith(`${groupPath}/`),
  )

  const directChildPaths = childPaths.filter(
    (key) => key.split("/").length === groupPathDepth + 1,
  )

  const configuredConfigSets = parseConfigSetNames(group?.configSets)
  const configSets = R.uniq([...inheritedConfigSets, ...configuredConfigSets])

  const configuredBootstrapConfigSets = parseConfigSetNames(
    group?.bootstrapConfigSets,
  )
  const bootstrapConfigSets = R.uniq([
    ...inheritedBootstrapConfigSets,
    ...configuredBootstrapConfigSets,
  ])

  const configuredLabels = parseLabels(group?.labels)
  const labels = R.uniq([...inheritedLabels, ...configuredLabels])

  const targetsSchema = parseTargetSchemas(group?.targetsSchema)
  const vars = deepCopy({ ...inheritedVars, ...parseVars(group?.vars) })

  const children = directChildPaths.map((childPath) =>
    parseDeploymentGroup(
      externalDeploymentTargets,
      childPath,
      config,
      vars,
      configSets,
      bootstrapConfigSets,
      labels,
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
    deploymentRole: parseCommandRole(group?.deploymentRole),
    bootstrapRole: parseCommandRole(group?.bootstrapRole),
    deploymentRoleName: group?.deploymentRoleName,
    bootstrapRoleName: group?.bootstrapRoleName,
    path: groupPath,
    description: group?.description,
    priority: group?.priority ?? 0,
    status: parseDeploymentStatus(group?.status),
  }
}

const parseDeploymentGroups = (
  externalDeploymentTargets: Map<DeploymentGroupPath, ReadonlyArray<unknown>>,
  value: any,
  inheritedVars: Vars,
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
    ),
  )
}

export const buildDeploymentConfig = async (
  ctx: CommandContext,
  logger: TkmLogger,
  schemaRegistry: DeploymentTargetsSchemaRegistry,
  externalDeploymentTargets: Map<DeploymentGroupPath, ReadonlyArray<unknown>>,
  externalConfigSets: Map<ConfigSetName, ConfigSet>,
  record: Record<string, unknown>,
): Promise<Result<DeploymentConfig, ValidationError>> => {
  const externalTargetNames = Array.from(externalDeploymentTargets.values())
    .map((targets) => targets.map((t) => (t as any).name as string))
    .flat()

  const nonUniqueExternalTargets = externalTargetNames.filter(
    (name) => externalTargetNames.filter(R.equals(name)).length > 1,
  )

  if (nonUniqueExternalTargets.length > 0) {
    const details = nonUniqueExternalTargets.map(
      (d) =>
        `Deployment target '${d}' is specified more than once in the externally configured targets`,
    )
    return err(
      new ValidationError(
        "Validation errors in deployment configuration.",
        details,
      ),
    )
  }

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
  const targetsSchema = parseTargetSchemas(record.targetsSchema)
  const parsedConfigSets = parseConfigSets(record.configSets)
  const configSets = mergeConfigSets(parsedConfigSets, externalConfigSets)

  const deploymentGroups = parseDeploymentGroups(
    externalDeploymentTargets,
    record.deploymentGroups,
    vars,
  )

  const configuredStackGroups = deploymentGroups
    .map((rootGroup) => collectFromHierarchy(rootGroup, (g) => g.children))
    .flat()

  if (externalDeploymentTargets.size > 0) {
    const configuredStackGroupPaths = configuredStackGroups.map(R.prop("path"))

    const externalGroupsNotConfigured = Array.from(
      externalDeploymentTargets.keys(),
    ).filter((e) => !configuredStackGroupPaths.includes(e))

    if (externalGroupsNotConfigured.length > 0) {
      const details = externalGroupsNotConfigured.map(
        (d) =>
          `Deployment group '${d}' is not found from the configuration file but is referenced in externally configured targets.`,
      )
      return err(
        new ValidationError(
          "Validation errors in deployment configuration.",
          details,
        ),
      )
    }
  }

  const targetNames = configuredStackGroups
    .map((g) => g.targets.map(R.prop("name")))
    .flat()

  const nonUniqueTargets = targetNames.filter(
    (targetName) => targetNames.filter(R.equals(targetName)).length > 1,
  )

  if (nonUniqueTargets.length > 0) {
    const details = nonUniqueTargets.map(
      (d) => `Target '${d}' is defined more than once in the configuration.`,
    )
    return err(
      new ValidationError(
        "Validation errors in deployment configuration.",
        details,
      ),
    )
  }

  const validationError = await validateDeploymentTargets(
    ctx,
    schemaRegistry,
    targetsSchema,
    deploymentGroups,
  )

  if (validationError) {
    return err(validationError)
  }

  return ok(
    deepFreeze({
      vars,
      configSets,
      deploymentGroups,
      targetsSchema,
    }),
  )
}

const validateDeploymentTargets = async (
  ctx: CommandContext,
  schemaRegistry: DeploymentTargetsSchemaRegistry,
  targetsSchema: ReadonlyArray<SchemaConfig>,
  deploymentGroups: ReadonlyArray<DeploymentGroupConfig>,
): Promise<ValidationError | undefined> => {
  const allTargets = deploymentGroups
    .reduce((collected, group) => {
      return [...collected, ...collectFromHierarchy(group, (g) => g.children)]
    }, new Array<DeploymentGroupConfig>())
    .map((group) =>
      group.targets.reduce((collected, target) => {
        return { ...collected, [`${group.path}/${target.name}`]: target }
      }, {}),
    )
    .flat()
    .reduce((collected, targets) => {
      return {
        ...collected,
        ...targets,
      }
    }, {})

  for (const schemaConfig of targetsSchema) {
    const schema = await schemaRegistry.initDeploymentTargetsSchema(
      ctx,
      "root",
      schemaConfig.name,
      schemaConfig,
    )

    const { error } = schema.validate(allTargets, { abortEarly: false })
    if (error) {
      const details = error.details.map(R.prop("message"))
      return new ValidationError(
        "Validation errors in deployment configuration",
        details,
      )
    }
  }

  for (const group of deploymentGroups) {
    const targets = Array.from(Object.entries(allTargets)).reduce(
      (collected, [targetPath, target]) => {
        return targetPath.startsWith(`${group.path}/`)
          ? { ...collected, [targetPath]: target }
          : collected
      },
      {},
    )

    for (const schemaConfig of group.targetsSchema) {
      const schema = await schemaRegistry.initDeploymentTargetsSchema(
        ctx,
        group.path,
        schemaConfig.name,
        schemaConfig,
      )

      const { error } = schema.validate(targets, { abortEarly: false })
      if (error) {
        const details = error.details.map(R.prop("message"))
        return new ValidationError(
          "Validation errors in deployment configuration",
          details,
        )
      }
    }
  }
}
