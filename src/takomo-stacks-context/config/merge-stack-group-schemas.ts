import { SchemasConfig } from "../../config/common-config.js"
import { CommandContext } from "../../context/command-context.js"
import { StackGroup } from "../../stacks/stack-group.js"
import { SchemaRegistry, Schemas } from "../../takomo-stacks-model/schemas.js"

export const mergeStackGroupSchemas = async (
  ctx: CommandContext,
  schemaRegistry: SchemaRegistry,
  stackGroup: StackGroup,
  schemasConfig?: SchemasConfig,
): Promise<Schemas | undefined> => {
  if (!schemasConfig) {
    return stackGroup.schemas
  }

  const dataSchemas = await Promise.all(
    schemasConfig.data.map((schemaConfig) =>
      schemaRegistry.initStackGroupDataSchema(
        ctx,
        stackGroup.path,
        schemaConfig.name,
        schemaConfig,
      ),
    ),
  )

  const tagsSchemas = await Promise.all(
    schemasConfig.tags.map((schemaConfig) =>
      schemaRegistry.initStackGroupTagsSchema(
        ctx,
        stackGroup.path,
        schemaConfig.name,
        schemaConfig,
      ),
    ),
  )

  const parametersSchemas = await Promise.all(
    schemasConfig.parameters.map((schemaConfig) =>
      schemaRegistry.initStackGroupParametersSchema(
        ctx,
        stackGroup.path,
        schemaConfig.name,
        schemaConfig,
      ),
    ),
  )

  const nameSchemas = await Promise.all(
    schemasConfig.name.map((schemaConfig) =>
      schemaRegistry.initStackGroupNameSchema(
        ctx,
        stackGroup.path,
        schemaConfig.name,
        schemaConfig,
      ),
    ),
  )

  return {
    data: [...(stackGroup.schemas?.data ?? []), ...dataSchemas],
    tags: [...(stackGroup.schemas?.tags ?? []), ...tagsSchemas],
    parameters: [
      ...(stackGroup.schemas?.parameters ?? []),
      ...parametersSchemas,
    ],
    name: [...(stackGroup.schemas?.name ?? []), ...nameSchemas],
  }
}
