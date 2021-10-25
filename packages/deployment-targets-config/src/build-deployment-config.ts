import {
  ConfigSet,
  ConfigSetName,
  mergeConfigSets,
  parseConfigSets,
} from "@takomo/config-sets"
import { CommandContext, parseVars } from "@takomo/core"
import {
  DeploymentGroupPath,
  DeploymentTargetsSchemaRegistry,
} from "@takomo/deployment-targets-model"
import {
  collectFromHierarchy,
  merge,
  TkmLogger,
  ValidationError,
} from "@takomo/util"
import { err, ok, Result } from "neverthrow"
import R from "ramda"
import { DeploymentConfig, DeploymentGroupConfig, SchemaConfig } from "./model"
import { parseDeploymentGroups } from "./parser/parse-deployment-groups"
import { parseTargetSchemas } from "./parser/parse-target-schemas"
import { createDeploymentTargetsConfigSchema } from "./schema"

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

  const vars = merge(ctx.variables.var, parseVars(record.vars))
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

  return ok({
    vars,
    configSets,
    deploymentGroups,
    targetsSchema,
  })
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
