import { ParameterName } from "../../model"
import { ListResolver } from "../../resolver/impl"
import { ResolverExecutor, ResolverInitializersMap } from "../../resolver/model"

const initializeResolver = async (
  paramName: ParameterName,
  paramConfig: any,
  initializers: ResolverInitializersMap,
): Promise<ResolverExecutor> => {
  const isStatic =
    typeof paramConfig === "string" ||
    typeof paramConfig === "number" ||
    typeof paramConfig === "boolean"
  const resolverType = isStatic ? "static" : paramConfig.resolver

  if (!resolverType) {
    throw new Error(`Parameter ${paramName} has no resolver property`)
  }

  if (typeof resolverType !== "string") {
    throw new Error(
      `Parameter ${paramName} has resolver property of invalid type, expected string`,
    )
  }

  const initializer = initializers.get(resolverType)
  if (!initializer) {
    throw new Error(
      `Parameter ${paramName} has unknown resolver ${resolverType}`,
    )
  }

  const resolver = await initializer(paramConfig)
  return new ResolverExecutor(resolverType, resolver, paramConfig)
}

export const buildParameters = async (
  parameters: Map<ParameterName, any>,
  initializers: ResolverInitializersMap,
): Promise<Map<ParameterName, ResolverExecutor>> => {
  const parametersMap = new Map<ParameterName, ResolverExecutor>()

  for (const [paramName, paramConfig] of Array.from(parameters.entries())) {
    if (Array.isArray(paramConfig)) {
      const resolvers = await Promise.all(
        paramConfig.map((item, index) =>
          initializeResolver(`${paramName}[${index}]`, item, initializers),
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
        initializers,
      )

      parametersMap.set(paramName, resolver)
    }
  }

  return parametersMap
}
