import { Constants } from "@takomo/core"
import {
  dirExists,
  Logger,
  readFileContents,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import path from "path"
import readdirp from "readdirp"
import { HookInitializersMap } from "../../hook/model"
import { ResolverInitializersMap } from "../../resolver/model"

const loadCustomResolvers = async (
  projectDir: string,
  logger: Logger,
  resolverInitializers: ResolverInitializersMap,
): Promise<void> => {
  const resolversDirPath = path.join(projectDir, Constants.RESOLVERS_DIR)
  if (await dirExists(resolversDirPath)) {
    logger.debug(`Found resolvers dir: ${resolversDirPath}`)

    const resolverFiles = await readdirp.promise(resolversDirPath, {
      alwaysStat: true,
      depth: 100,
      type: "files",
      fileFilter: e => e.basename.endsWith(".js"),
    })

    for (const resolverFile of resolverFiles) {
      // eslint-disable-next-line
      const { name, init } = require(resolverFile.fullPath)
      if (!name) {
        throw new TakomoError(
          `Resolver name not defined in ${resolverFile.fullPath}`,
        )
      }

      if (resolverInitializers.has(name)) {
        throw new TakomoError(
          `Resolver name '${name}' defined in ${resolverFile.fullPath} is already registered`,
        )
      }

      if (!init) {
        throw new TakomoError(
          `Resolver init not defined in ${resolverFile.fullPath}`,
        )
      }

      logger.debug(`Register resolver: ${name}`)
      resolverInitializers.set(name, init)
    }
  } else {
    logger.debug("Resolvers dir not found")
  }
}

const loadCustomHelpers = async (
  projectDir: string,
  logger: Logger,
  te: TemplateEngine,
) => {
  const helpersDirPath = path.join(projectDir, Constants.HELPERS_DIR)
  if (await dirExists(helpersDirPath)) {
    logger.debug(`Found helpers dir: ${helpersDirPath}`)

    const helperFiles = await readdirp.promise(helpersDirPath, {
      alwaysStat: true,
      depth: 100,
      type: "files",
      fileFilter: e => e.basename.endsWith(".js"),
    })

    for (const helperFile of helperFiles) {
      // eslint-disable-next-line
      const helper = require(helperFile.fullPath)
      if (!helper.name) {
        throw new TakomoError(
          `Helper name not defined in ${helperFile.fullPath}`,
        )
      }
      if (!helper.fn) {
        throw new TakomoError(`Helper fn not defined in ${helperFile.fullPath}`)
      }

      logger.debug(`Register helper: ${helper.name}`)
      te.registerHelper(helper.name, helper.fn)
    }
  } else {
    logger.debug("Helpers dir not found")
  }
}

const loadCustomHooks = async (
  projectDir: string,
  logger: Logger,
  hookInitializers: HookInitializersMap,
): Promise<void> => {
  const hooksDirPath = path.join(projectDir, Constants.HOOKS_DIR)
  if (await dirExists(hooksDirPath)) {
    logger.debug(`Found hooks dir: ${hooksDirPath}`)

    const hookFiles = await readdirp.promise(hooksDirPath, {
      alwaysStat: true,
      depth: 100,
      type: "files",
      fileFilter: e => e.basename.endsWith(".js"),
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

const loadCustomPartials = async (
  projectDir: string,
  logger: Logger,
  te: TemplateEngine,
): Promise<void> => {
  const partialsDirPath = path.join(projectDir, Constants.PARTIALS_DIR)
  if (await dirExists(partialsDirPath)) {
    logger.debug(`Found partials dir: ${partialsDirPath}`)

    const partialFiles = await readdirp.promise(partialsDirPath, {
      alwaysStat: true,
      depth: 100,
      type: "files",
    })

    for (const partialFile of partialFiles) {
      const name = partialFile.fullPath.substr(partialsDirPath.length + 1)

      logger.debug(`Register partial: ${name}`)
      const contents = await readFileContents(partialFile.fullPath)
      te.registerPartial(name, contents)
    }
  } else {
    logger.debug("Partials dir not found")
  }
}

export const loadExtensions = async (
  projectDir: string,
  logger: Logger,
  resolverInitializers: ResolverInitializersMap,
  hookInitializers: HookInitializersMap,
  te: TemplateEngine,
): Promise<void> => {
  await Promise.all([
    loadCustomResolvers(projectDir, logger, resolverInitializers),
    loadCustomHelpers(projectDir, logger, te),
    loadCustomHooks(projectDir, logger, hookInitializers),
    loadCustomPartials(projectDir, logger, te),
  ])
}
