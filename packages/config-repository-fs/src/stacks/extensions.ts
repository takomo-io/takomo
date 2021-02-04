import { HookInitializersMap, SchemaRegistry } from "@takomo/stacks-model"
import { ResolverRegistry } from "@takomo/stacks-resolvers"
import { dirExists, FilePath, TakomoError, TkmLogger } from "@takomo/util"
import readdirp from "readdirp"

export const loadCustomResolvers = async (
  resolversDir: FilePath,
  logger: TkmLogger,
  resolverRegistry: ResolverRegistry,
): Promise<void> => {
  if (!(await dirExists(resolversDir))) {
    logger.debug(`Resolvers dir not found: ${resolversDir}`)
    return
  }

  logger.debug(`Found resolvers dir: ${resolversDir}`)

  const resolverFiles = await readdirp.promise(resolversDir, {
    alwaysStat: true,
    depth: 100,
    type: "files",
    fileFilter: (e) => e.basename.endsWith(".js"),
  })

  for (const resolverFile of resolverFiles) {
    await resolverRegistry.registerProviderFromFile(resolverFile.fullPath)
  }
}

export const loadCustomHooks = async (
  hooksDir: FilePath,
  logger: TkmLogger,
  hookInitializers: HookInitializersMap,
): Promise<void> => {
  if (await dirExists(hooksDir)) {
    logger.debug(`Found hooks dir: ${hooksDir}`)

    const hookFiles = await readdirp.promise(hooksDir, {
      alwaysStat: true,
      depth: 100,
      type: "files",
      fileFilter: (e) => e.basename.endsWith(".js"),
    })

    for (const hookFile of hookFiles) {
      // eslint-disable-next-line
      const { type, init } = require(hookFile.fullPath)
      if (!type) {
        throw new TakomoError(`Hook type not defined in ${hookFile.fullPath}`)
      }
      if (hookInitializers.has(type)) {
        throw new TakomoError(
          `Hook type '${type}' defined in ${hookFile.fullPath} is already registered`,
        )
      }
      if (!init) {
        throw new TakomoError(`Hook init not defined in ${hookFile.fullPath}`)
      }

      logger.debug(`Register hook: ${type}`)
      hookInitializers.set(type, init)
    }
  } else {
    logger.debug("Hooks dir not found")
  }
}

interface LoadCustomSchemasProps {
  readonly schemasDir: FilePath
  readonly logger: TkmLogger
  readonly registry: SchemaRegistry
}

export const loadCustomSchemas = async ({
  schemasDir,
  logger,
  registry,
}: LoadCustomSchemasProps): Promise<void> => {
  if (!(await dirExists(schemasDir))) {
    logger.debug("Schemas dir not found")
  }

  logger.debug(`Found schemas dir: ${schemasDir}`)

  const schemaFiles = await readdirp.promise(schemasDir, {
    alwaysStat: true,
    depth: 100,
    type: "files",
    fileFilter: (e) => e.basename.endsWith(".js"),
  })

  schemaFiles.map((f) => f.fullPath).forEach(registry.registerProviderFromFile)
}
