import { ParameterName, ResolverExecutor } from "@takomo/stacks-model"
import { ListResolver, ResolverRegistry } from "@takomo/stacks-resolvers"

const initializeResolver = async (
  paramName: ParameterName,
  paramConfig: any,
  resolverRegistry: ResolverRegistry,
): Promise<ResolverExecutor> => {
  const isStatic =
    typeof paramConfig === "string" ||
    typeof paramConfig === "number" ||
    typeof paramConfig === "boolean"
  const resolverType = isStatic ? "static" : paramConfig.resolver

  if (!resolverType) {
    throw new Error(`Parameter '${paramName}' has no resolver property`)
  }

  if (typeof resolverType !== "string") {
    throw new Error(
      `Parameter '${paramName}' has resolver property of invalid type, expected string`,
    )
  }

  const resolver = await resolverRegistry.initResolver(
    resolverType,
    paramConfig,
  )

  return new ResolverExecutor(resolverType, resolver, paramConfig)
}

export const buildParameters = async (
  parameters: Map<ParameterName, any>,
  resolverRegistry: ResolverRegistry,
): Promise<Map<ParameterName, ResolverExecutor>> => {
  const parametersMap = new Map<ParameterName, ResolverExecutor>()

  for (const [paramName, paramConfig] of Array.from(parameters.entries())) {
    if (Array.isArray(paramConfig)) {
      const resolvers = await Promise.all(
        paramConfig.map((item, index) =>
          initializeResolver(`${paramName}[${index}]`, item, resolverRegistry),
        ),
      )

      parametersMap.set(
        paramName,
        new ResolverExecutor("list", new ListResolver(resolvers), paramConfig),
      )
    } else {
      const resolver = await initializeResolver(
        paramName,
        paramConfig,
        resolverRegistry,
      )

      parametersMap.set(paramName, resolver)
    }
  }

  return parametersMap
}
