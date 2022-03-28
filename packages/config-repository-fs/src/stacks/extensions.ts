import { HookRegistry } from "@takomo/stacks-hooks"
import { SchemaRegistry } from "@takomo/stacks-model"
import { ResolverRegistry } from "@takomo/stacks-resolvers"
import { dirExists, FilePath, TkmLogger } from "@takomo/util"
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
  hookRegistry: HookRegistry,
): Promise<void> => {
  if (!(await dirExists(hooksDir))) {
    logger.debug("Hooks dir not found")
    return
  }

  logger.debug(`Found hooks dir: ${hooksDir}`)

  const hookFiles = await readdirp.promise(hooksDir, {
    alwaysStat: true,
    depth: 100,
    type: "files",
    fileFilter: (e) => e.basename.endsWith(".js"),
  })

  for (const hookFile of hookFiles) {
    await hookRegistry.registerProviderFromFile(hookFile.fullPath)
  }
}

interface LoadCustomSchemasProps {
  readonly schemasDirs: ReadonlyArray<FilePath>
  readonly logger: TkmLogger
  readonly registry: SchemaRegistry
}

export const loadCustomSchemas = async ({
  schemasDirs,
  logger,
  registry,
}: LoadCustomSchemasProps): Promise<void> => {
  for (const schemasDir of schemasDirs) {
    if (!(await dirExists(schemasDir))) {
      throw new Error(`Schemas dir not found: ${schemasDir}`)
    }

    logger.debug(`Found schemas dir: ${schemasDir}`)

    const schemaFiles = await readdirp.promise(schemasDir, {
      alwaysStat: true,
      depth: 100,
      type: "files",
      fileFilter: (e) => e.basename.endsWith(".js"),
    })

    schemaFiles
      .map((f) => f.fullPath)
      .forEach(registry.registerProviderFromFile)
  }
}
