import path from "path"
import { InternalTakomoProjectConfig } from "../../config/project-config.js"
import { StackConfig } from "../../config/stack-config.js"
import { InternalCommandContext } from "../../context/command-context.js"
import { TakomoConfig } from "../../extensions/config-customizer.js"
import { HookRegistry } from "../../hooks/hook-registry.js"
import { ResolverRegistry } from "../../resolvers/resolver-registry.js"
import { BlueprintPath } from "../../stacks/standard-stack.js"
import {
  StacksConfigRepository,
  StacksConfigRepositoryProps,
} from "../../takomo-stacks-context/model.js"
import { ROOT_STACK_GROUP_PATH } from "../../takomo-stacks-model/constants.js"
import { SchemaRegistry } from "../../takomo-stacks-model/schemas.js"
import { EjsTemplateEngineProvider } from "../../templating/ejs/ejs-template-engine-provider.js"
import { InternalHandlebarsTemplateEngineProvider } from "../../templating/handlebars/internal-handlebars-template-engine-provider.js"
import { TemplateEngineProvider } from "../../templating/template-engine-provider.js"
import {
  FilePath,
  dirExists,
  fileExists,
  readFileContents,
} from "../../utils/files.js"
import { TkmLogger } from "../../utils/logging.js"
import { buildStackGroupConfigNode } from "./config-tree.js"
import {
  loadCustomHooks,
  loadCustomResolvers,
  loadCustomSchemas,
} from "./extensions.js"
import { parseBlueprintConfigFile } from "./parser.js"
import { ConfigTree } from "../../takomo-stacks-context/config/config-tree.js"
import { CustomStackHandler } from "../../custom-stack-handler/custom-stack-handler.js"
import { CustomStackHandlerRegistry } from "../../custom-stack-handler/custom-stack-handler-registry.js"

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

    const configProviderFile = await import(ctx.projectConfig.esbuild.outFile)

    if (!configProviderFile.default) {
      throw new Error(
        `File ${ctx.projectConfig.esbuild.outFile} doesn't have default export`,
      )
    }

    return configProviderFile.default({ projectDir })
  } else {
    return {}
  }
}

const getTemplateEngineProvider = (
  takomoConfig: TakomoConfig,
  projectConfig: InternalTakomoProjectConfig,
  logger: TkmLogger,
  partialsDir: FilePath,
  helpersDir: FilePath,
): TemplateEngineProvider => {
  if (takomoConfig.templateEngineProvider) {
    return takomoConfig.templateEngineProvider
  }

  return projectConfig.templateEngine === "ejs"
    ? new EjsTemplateEngineProvider({ logger })
    : new InternalHandlebarsTemplateEngineProvider({
        logger,
        partialsDir,
        helpersDir,
        projectConfig,
      })
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

  const templateEngineProvider = getTemplateEngineProvider(
    takomoConfig,
    ctx.projectConfig,
    logger,
    partialsDir,
    helpersDir,
  )

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      sourceDescription: "inline template",
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
      customStackHandlerRegistry: CustomStackHandlerRegistry,
    ): Promise<void> => {
      await Promise.all([
        loadCustomResolvers(resolversDir, logger, resolverRegistry),
        loadCustomHooks(hooksDir, logger, hookRegistry),
        loadCustomSchemas({ schemasDirs, logger, registry: schemaRegistry }),
      ])

      takomoConfig.customStackHandlers?.forEach((provider) => {
        customStackHandlerRegistry.registerHandler(provider)
      })

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
