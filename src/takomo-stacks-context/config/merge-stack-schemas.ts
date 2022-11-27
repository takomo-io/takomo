import { SchemasConfig } from "../../config/common-config"
import { CommandContext } from "../../context/command-context"
import { StackPath } from "../../stacks/stack"
import { SchemaRegistry, Schemas } from "../../takomo-stacks-model/schemas"

export const mergeStackSchemas = async (
  ctx: CommandContext,
  schemaRegistry: SchemaRegistry,
  stackPath: StackPath,
  inheritedSchemas?: Schemas,
  schemasConfig?: SchemasConfig,
  blueprintSchemasConfig?: SchemasConfig,
): Promise<Schemas | undefined> => {
  if (!schemasConfig && !blueprintSchemasConfig) {
    return inheritedSchemas
  }

  const joinedDataSchemas = [
    ...(blueprintSchemasConfig?.data ?? []),
    ...(schemasConfig?.data ?? []),
  ]

  const dataSchemas = await Promise.all(
    joinedDataSchemas.map((schemaConfig) =>
      schemaRegistry.initStackDataSchema(
        ctx,
        stackPath,
        schemaConfig.name,
        schemaConfig,
      ),
    ),
  )

  const joinedTagsSchemas = [
    ...(blueprintSchemasConfig?.tags ?? []),
    ...(schemasConfig?.tags ?? []),
  ]

  const tagsSchemas = await Promise.all(
    joinedTagsSchemas.map((schemaConfig) =>
      schemaRegistry.initStackTagsSchema(
        ctx,
        stackPath,
        schemaConfig.name,
        schemaConfig,
      ),
    ),
  )

  const joinedParametersSchemas = [
    ...(blueprintSchemasConfig?.parameters ?? []),
    ...(schemasConfig?.parameters ?? []),
  ]

  const parametersSchemas = await Promise.all(
    joinedParametersSchemas.map((schemaConfig) =>
      schemaRegistry.initStackParametersSchema(
        ctx,
        stackPath,
        schemaConfig.name,
        schemaConfig,
      ),
    ),
  )

  const joinedNameSchemas = [
    ...(blueprintSchemasConfig?.name ?? []),
    ...(schemasConfig?.name ?? []),
  ]

  const nameSchemas = await Promise.all(
    joinedNameSchemas.map((schemaConfig) =>
      schemaRegistry.initStackNameSchema(
        ctx,
        stackPath,
        schemaConfig.name,
        schemaConfig,
      ),
    ),
  )

  return {
    data: [...(inheritedSchemas?.data ?? []), ...dataSchemas],
    tags: [...(inheritedSchemas?.tags ?? []), ...tagsSchemas],
    parameters: [...(inheritedSchemas?.parameters ?? []), ...parametersSchemas],
    name: [...(inheritedSchemas?.name ?? []), ...nameSchemas],
  }
}
