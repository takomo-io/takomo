import path from "path"
import { StackConfig } from "../../config/stack-config"
import { InternalCommandContext } from "../../context/command-context"
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
import { TakomoError } from "../../utils/errors"
import {
  dirExists,
  fileExists,
  FilePath,
  readFileContents,
} from "../../utils/files"
import { TkmLogger } from "../../utils/logging"
import { createTemplateEngine, renderTemplate } from "../../utils/templating"
import { loadTemplateHelpers, loadTemplatePartials } from "../template-engine"
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
}: FileSystemStacksConfigRepositoryProps): Promise<StacksConfigRepository> => {
  const templateEngine = createTemplateEngine()

  ctx.projectConfig.helpers.forEach((config) => {
    logger.debug(
      `Register Handlebars helper from NPM package: ${config.package}`,
    )
    // eslint-disable-next-line
    const helper = require(config.package)
    const helperWithName = config.name
      ? { ...helper, name: config.name }
      : helper

    if (typeof helperWithName.fn !== "function") {
      throw new TakomoError(
        `Handlebars helper loaded from an NPM package ${config.package} does not export property 'fn' of type function`,
      )
    }

    if (typeof helperWithName.name !== "string") {
      throw new TakomoError(
        `Handlebars helper loaded from an NPM package ${config.package} does not export property 'name' of type string`,
      )
    }

    templateEngine.registerHelper(helperWithName.name, helperWithName.fn)
  })

  const defaultHelpersDirExists = await dirExists(helpersDir)
  const additionalHelpersDirs = ctx.projectConfig.helpersDir

  const helpersDirs = defaultHelpersDirExists
    ? [helpersDir, ...additionalHelpersDirs]
    : additionalHelpersDirs

  const defaultPartialsDirExists = await dirExists(partialsDir)
  const additionalPartialsDirs = ctx.projectConfig.partialsDir

  const partialsDirs = defaultPartialsDirExists
    ? [partialsDir, ...additionalPartialsDirs]
    : additionalPartialsDirs

  const defaultSchemasDirExists = await dirExists(schemasDir)
  const additionalSchemasDirs = ctx.projectConfig.schemasDir

  const schemasDirs = defaultSchemasDirExists
    ? [schemasDir, ...additionalSchemasDirs]
    : additionalSchemasDirs

  await Promise.all([
    loadTemplateHelpers(helpersDirs, logger, templateEngine),
    loadTemplatePartials(partialsDirs, logger, templateEngine),
  ])

  const getStackTemplateContentsFromFile = async (
    variables: any,
    filename: string,
    dynamic: boolean,
  ): Promise<string> => {
    const pathToTemplate = path.join(templatesDir, filename)
    const content = await readFileContents(pathToTemplate)

    if (!dynamic) {
      return content
    }

    logger.traceText("Raw template body:", () => content)
    logger.traceObject("Render template using variables:", () => variables)

    const renderedContent = await renderTemplate(
      templateEngine,
      pathToTemplate,
      content,
      variables,
    )

    logger.traceText("Final rendered template:", () => renderedContent)
    return renderedContent
  }

  const getStackTemplateContentsFromInline = async (
    variables: any,
    content: string,
    dynamic: boolean,
  ): Promise<string> => {
    if (!dynamic) {
      return content
    }

    logger.traceText("Raw template body:", () => content)
    logger.traceObject("Render template using variables:", () => variables)

    const renderedContent = await renderTemplate(
      templateEngine,
      "inlined template",
      content,
      variables,
    )

    logger.traceText("Final rendered template:", () => renderedContent)
    return renderedContent
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
