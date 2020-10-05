import { StackPath } from "@takomo/core"
import { ParameterName, ResolverExecutor } from "@takomo/stacks-model"
import { ListResolver, ResolverRegistry } from "@takomo/stacks-resolvers"
import { FilePath, TakomoError } from "@takomo/util"

const initializeResolver = async (
  filePath: FilePath,
  stackPath: StackPath,
  paramName: ParameterName,
  paramConfig: any,
  resolverRegistry: ResolverRegistry,
): Promise<ResolverExecutor> => {
  const isStatic =
    typeof paramConfig === "string" ||
    typeof paramConfig === "number" ||
    typeof paramConfig === "boolean"
  const resolverName = isStatic ? "static" : paramConfig.resolver

  if (!resolverName) {
    throw new TakomoError(
      `1 validation error(s) in stack config file ${filePath}:\n\n` +
        `  - Expected 'resolver' property in parameter '${paramName}' but none was found`,
    )
  }

  const resolverType = typeof resolverName
  if (resolverType !== "string") {
    throw new TakomoError(
      `1 validation error(s) in stack config file ${filePath}:\n\n` +
        `  - Expected 'resolver' property in parameter '${paramName}' to be string but got ${resolverType}`,
    )
  }

  if (!resolverRegistry.hasProvider(resolverName)) {
    const availableResolvers = resolverRegistry
      .getRegisteredResolverNames()
      .map((r) => `  - ${r}`)
      .join("\n")
    throw new TakomoError(
      `1 validation error(s) in stack config file ${filePath}:\n\n` +
        `  - Unknown resolver '${resolverName}' in parameter '${paramName}'\n\n` +
        `Available resolvers:\n${availableResolvers}`,
    )
  }

  const resolver = await resolverRegistry.initResolver(
    filePath,
    paramName,
    resolverName,
    isStatic ? { resolver: "static", value: paramConfig } : paramConfig,
  )

  return new ResolverExecutor(resolverName, resolver, paramConfig)
}

export const buildParameters = async (
  filePath: FilePath,
  stackPath: StackPath,
  parameters: Map<ParameterName, any>,
  resolverRegistry: ResolverRegistry,
): Promise<Map<ParameterName, ResolverExecutor>> => {
  const parametersMap = new Map<ParameterName, ResolverExecutor>()

  for (const [paramName, paramConfig] of Array.from(parameters.entries())) {
    if (Array.isArray(paramConfig)) {
      const resolvers = await Promise.all(
        paramConfig.map((item, index) =>
          initializeResolver(
            filePath,
            stackPath,
            `${paramName}[${index}]`,
            item,
            resolverRegistry,
          ),
        ),
      )

      parametersMap.set(
        paramName,
        new ResolverExecutor("list", new ListResolver(resolvers), paramConfig),
      )
    } else {
      const resolver = await initializeResolver(
        filePath,
        stackPath,
        paramName,
        paramConfig,
        resolverRegistry,
      )

      parametersMap.set(paramName, resolver)
    }
  }

  return parametersMap
}
