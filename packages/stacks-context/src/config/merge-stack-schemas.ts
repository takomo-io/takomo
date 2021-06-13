import { CommandContext } from "@takomo/core"
import { SchemasConfig } from "@takomo/stacks-config"
import { SchemaRegistry, Schemas, StackPath } from "@takomo/stacks-model"

export const mergeStackSchemas = async (
  ctx: CommandContext,
  schemaRegistry: SchemaRegistry,
  stackPath: StackPath,
  inheritedSchemas?: Schemas,
  schemasConfig?: SchemasConfig,
): Promise<Schemas | undefined> => {
  if (!schemasConfig) {
    return inheritedSchemas
  }

  const dataSchemas = await Promise.all(
    schemasConfig.data.map((schemaConfig) =>
      schemaRegistry.initStackDataSchema(
        ctx,
        stackPath,
        schemaConfig.name,
        schemaConfig,
      ),
    ),
  )

  const tagsSchemas = await Promise.all(
    schemasConfig.tags.map((schemaConfig) =>
      schemaRegistry.initStackTagsSchema(
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
  }
}
