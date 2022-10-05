import { StackParameterKey } from "../../takomo-aws-model"
import { CommandContext } from "../../takomo-core"
import { ParameterConfig, ParameterConfigs } from "../../takomo-stacks-config"
import { SchemaRegistry, StackPath } from "../../takomo-stacks-model"
import { ResolverRegistry } from "../../takomo-stacks-resolvers"
import { TakomoError } from "../../takomo-util"
import {
  ListResolverExecutor,
  ResolverExecutor,
  SingleResolverExecutor,
} from "../model"

const initializeResolver = async (
  ctx: CommandContext,
  stackPath: StackPath,
  paramName: StackParameterKey,
  paramConfig: ParameterConfig,
  resolverRegistry: ResolverRegistry,
  schemaRegistry: SchemaRegistry,
): Promise<ResolverExecutor> => {
  const resolverName = paramConfig.resolver

  if (!resolverRegistry.hasProvider(resolverName)) {
    const availableResolvers = resolverRegistry
      .getRegisteredResolverNames()
      .map((r) => `  - ${r}`)
      .join("\n")
    throw new TakomoError(
      `1 validation error(s) in stack ${stackPath}:\n\n` +
        `  - Unknown resolver '${resolverName}' in parameter '${paramName}'\n\n` +
        `Available resolvers:\n${availableResolvers}`,
    )
  }

  const resolver = await resolverRegistry.initResolver(
    ctx,
    stackPath,
    paramName,
    resolverName,
    paramConfig,
  )

  const schema = paramConfig.schema
    ? await schemaRegistry.initParameterSchema(
        ctx,
        stackPath,
        paramName,
        paramConfig.schema?.name,
        paramConfig.schema,
      )
    : undefined

  return new SingleResolverExecutor(resolverName, resolver, paramConfig, schema)
}

export const buildParameters = async (
  ctx: CommandContext,
  stackPath: StackPath,
  parameters: Map<StackParameterKey, ParameterConfigs>,
  resolverRegistry: ResolverRegistry,
  schemaRegistry: SchemaRegistry,
): Promise<Map<StackParameterKey, ResolverExecutor>> => {
  const parametersMap = new Map<StackParameterKey, ResolverExecutor>()

  for (const [paramName, paramConfig] of Array.from(parameters.entries())) {
    if (paramConfig.isList) {
      const resolvers = await Promise.all(
        paramConfig.items.map((item, index) =>
          initializeResolver(
            ctx,
            stackPath,
            `${paramName}[${index}]`,
            item,
            resolverRegistry,
            schemaRegistry,
          ),
        ),
      )

      parametersMap.set(
        paramName,
        new ListResolverExecutor(
          "list",
          resolvers,
          paramConfig.immutable,
          paramConfig.confidential,
        ),
      )
    } else {
      const resolver = await initializeResolver(
        ctx,
        stackPath,
        paramName,
        paramConfig.config,
        resolverRegistry,
        schemaRegistry,
      )

      parametersMap.set(paramName, resolver)
    }
  }

  return parametersMap
}
