import { CommandContext } from "@takomo/core"
import { ConfigTree, StacksConfigRepository } from "@takomo/stacks-context"
import {
  HookInitializersMap,
  ROOT_STACK_GROUP_PATH,
  StackPath,
} from "@takomo/stacks-model"
import { ResolverRegistry } from "@takomo/stacks-resolvers"
import {
  createTemplateEngine,
  deepFreeze,
  FilePath,
  readFileContents,
  renderTemplate,
  TkmLogger,
} from "@takomo/util"
import path from "path"
import { loadTemplateHelpers, loadTemplatePartials } from "../template-engine"
import { buildStackGroupConfigNode } from "./config-tree"
import { loadCustomHooks, loadCustomResolvers } from "./extensions"

export interface FileSystemStacksConfigRepositoryProps {
  readonly ctx: CommandContext
  readonly logger: TkmLogger
  readonly projectDir: FilePath
  readonly stacksDir: FilePath
  readonly resolversDir: FilePath
  readonly hooksDir: FilePath
  readonly helpersDir: FilePath
  readonly partialsDir: FilePath
  readonly templatesDir: FilePath
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
}: FileSystemStacksConfigRepositoryProps): Promise<StacksConfigRepository> => {
  const templateEngine = createTemplateEngine()

  await Promise.all([
    loadTemplateHelpers(helpersDir, logger, templateEngine),
    loadTemplatePartials(partialsDir, logger, templateEngine),
  ])

  return deepFreeze({
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
      hookInitializers: HookInitializersMap,
    ): Promise<void> => {
      await Promise.all([
        loadCustomResolvers(resolversDir, logger, resolverRegistry),
        loadCustomHooks(hooksDir, logger, hookInitializers),
      ])
    },

    getStackTemplateContents: async (
      stackPath: StackPath,
      variables: any,
      templatePath?: string,
    ): Promise<string> => {
      const filepath =
        templatePath ?? stackPath.substr(1).split("/").slice(0, -1).join("/")

      const pathToTemplate = path.join(templatesDir, filepath)
      const content = await readFileContents(pathToTemplate)

      logger.traceText("Raw template body:", content)

      logger.traceObject("Render template using variables:", variables)

      const renderedContent = await renderTemplate(
        templateEngine,
        pathToTemplate,
        content,
        variables,
      )

      logger.traceText("Final rendered template:", renderedContent)
      return renderedContent
    },

    templateEngine,
  })
}
