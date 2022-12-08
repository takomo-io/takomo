import { StackParameterKey } from "../../aws/cloudformation/model"
import { ParameterConfig, ParameterConfigs } from "../../config/common-config"
import { CommandContext } from "../../context/command-context"
import { ResolverRegistry } from "../../resolvers/resolver-registry"
import { StackPath } from "../../stacks/stack"
import { SchemaRegistry } from "../../takomo-stacks-model/schemas"
import { TakomoError } from "../../utils/errors"
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
