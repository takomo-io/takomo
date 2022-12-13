import path from "path"
import { StackConfig } from "../../config/stack-config"
import { InternalCommandContext } from "../../context/command-context"
import { TakomoConfig } from "../../extensions/config-customizer"
import { HookRegistry } from "../../hooks/hook-registry"
import { ResolverRegistry } from "../../resolvers/resolver-registry"
import { BlueprintPath } from "../../stacks/stack"
import {
  ConfigTree,
  StacksConfigRepository,
  StacksConfigRepositoryProps,
} from "../../takomo-stacks-context"
import { ROOT_STACK_GROUP_PATH } from "../../takomo-stacks-model/constants"
import { SchemaRegistry } from "../../takomo-stacks-model/schemas"
import { HandlebarsTemplateEngineProvider } from "../../templating/handlebars/handlebars-template-engine-provider"
import {
  dirExists,
  fileExists,
  FilePath,
  readFileContents,
} from "../../utils/files"
import { TkmLogger } from "../../utils/logging"
import { buildStackGroupConfigNode } from "./config-tree"
import {
  loadCustomHooks,
  loadCustomResolvers,
  loadCustomSchemas,
} from "./extensions"
import { parseBlueprintConfigFile } from "./parser"

export interface FileSystemStacksConfigRepositoryProps {
  readonly ctx: InternalCommandContext
  readonly logger: TkmLogger
  readonly projectDir: FilePath
  readonly stacksDir: FilePath
  readonly resolversDir: FilePath
  readonly hooksDir: FilePath
  readonly helpersDir: FilePath
  readonly partialsDir: FilePath
  readonly blueprintsDir: FilePath
  readonly templatesDir: FilePath
  readonly schemasDir: FilePath
  readonly cacheDir: FilePath
  readonly configFileExtension: string
  readonly stackGroupConfigFileName: string
}

const loadProjectConfig = async (
  ctx: InternalCommandContext,
  projectDir: FilePath,
  logger: TkmLogger,
): Promise<TakomoConfig> => {
  if (
    ctx.projectConfig.esbuild.enabled &&
    (await fileExists(ctx.projectConfig.esbuild.outFile))
  ) {
    logger.debug(
      `Load project config from compiled typescript file: ${ctx.projectConfig.esbuild.outFile}`,
    )

    const configProvider = await import(ctx.projectConfig.esbuild.outFile)
    return configProvider.default({ projectDir })
  } else {
    return {}
  }
}

export const createFileSystemStacksConfigRepository = async ({
  ctx,
  logger,
  stacksDir,
  resolversDir,
  helpersDir,
  hooksDir,
  partialsDir,
  configFileExtension,
  stackGroupConfigFileName,
  templatesDir,
  schemasDir,
  blueprintsDir,
  projectDir,
}: FileSystemStacksConfigRepositoryProps): Promise<StacksConfigRepository> => {
  const takomoConfig = await loadProjectConfig(ctx, projectDir, logger)

  const templateEngineProvider =
    takomoConfig.templateEngineProvider ??
    new HandlebarsTemplateEngineProvider({
      logger,
      partialsDir,
      helpersDir,
      projectConfig: ctx.projectConfig,
    })

  const templateEngine = await templateEngineProvider.init({
    projectDir,
    logger,
  })
  const defaultSchemasDirExists = await dirExists(schemasDir)
  const additionalSchemasDirs = ctx.projectConfig.schemasDir

  const schemasDirs = defaultSchemasDirExists
    ? [schemasDir, ...additionalSchemasDirs]
    : additionalSchemasDirs

  const getStackTemplateContentsFromFile = async (
    variables: any,
    filename: string,
    dynamic: boolean,
  ): Promise<string> => {
    const pathToFile = path.join(templatesDir, filename)

    if (!dynamic) {
      return readFileContents(pathToFile)
    }

    return templateEngine.renderTemplateFile({
      pathToFile,
      variables,
    })
  }

  const getStackTemplateContentsFromInline = async (
    variables: any,
    content: string,
    dynamic: boolean,
  ): Promise<string> => {
    if (!dynamic) {
      return content
    }

    return templateEngine.renderTemplate({
      templateString: content,
      variables,
    })
  }

  return {
    buildConfigTree: async (): Promise<ConfigTree> =>
      buildStackGroupConfigNode(
        ctx,
        templateEngine,
        logger,
        configFileExtension,
        stackGroupConfigFileName,
        stacksDir,
        ROOT_STACK_GROUP_PATH,
      ).then((rootStackGroup) => ({
        rootStackGroup,
      })),

    loadExtensions: async (
      resolverRegistry: ResolverRegistry,
      hookRegistry: HookRegistry,
      schemaRegistry: SchemaRegistry,
    ): Promise<void> => {
      await Promise.all([
        loadCustomResolvers(resolversDir, logger, resolverRegistry),
        loadCustomHooks(hooksDir, logger, hookRegistry),
        loadCustomSchemas({ schemasDirs, logger, registry: schemaRegistry }),
      ])

      for (const [i, provider] of (
        takomoConfig.hookProviders ?? []
      ).entries()) {
        await hookRegistry.registerProviderFromSource(
          provider,
          `${ctx.projectConfig.esbuild.entryPoint}#hookProviders[${i}]`,
        )
      }

      for (const [i, provider] of (
        takomoConfig.resolverProviders ?? []
      ).entries()) {
        await resolverRegistry.registerProviderFromSource(
          provider,
          `${ctx.projectConfig.esbuild.entryPoint}#resolverProviders[${i}]`,
        )
      }

      for (const [i, provider] of (
        takomoConfig.schemaProviders ?? []
      ).entries()) {
        await schemaRegistry.registerFromSource(
          provider,
          `${ctx.projectConfig.esbuild.entryPoint}#schemaProviders[${i}]`,
        )
      }
    },

    getStackTemplateContents: async ({
      variables,
      filename,
      inline,
      dynamic,
    }: StacksConfigRepositoryProps): Promise<string> => {
      if (filename) {
        return getStackTemplateContentsFromFile(variables, filename, dynamic)
      }
      if (inline) {
        return getStackTemplateContentsFromInline(variables, inline, dynamic)
      }

      throw new Error("Expected either filename or inline to be defined")
    },

    getBlueprint: async (
      blueprint: BlueprintPath,
      variables: any,
    ): Promise<StackConfig> => {
      const pathToBlueprint = path.join(blueprintsDir, blueprint)
      if (!(await fileExists(pathToBlueprint))) {
        throw new Error(`Blueprint file ${blueprint} not found!`)
      }

      return parseBlueprintConfigFile(
        ctx,
        variables,
        templateEngine,
        logger,
        pathToBlueprint,
      )
    },

    templateEngine,
  }
}
