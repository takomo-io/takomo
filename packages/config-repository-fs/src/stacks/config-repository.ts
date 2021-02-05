import { CommandContext } from "@takomo/core"
import { ConfigTree, StacksConfigRepository } from "@takomo/stacks-context"
import {
  HookInitializersMap,
  ROOT_STACK_GROUP_PATH,
  SchemaRegistry,
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
import {
  loadCustomHooks,
  loadCustomResolvers,
  loadCustomSchemas,
} from "./extensions"

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
  readonly schemasDir: FilePath
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
      schemaRegistry: SchemaRegistry,
    ): Promise<void> => {
      await Promise.all([
        loadCustomResolvers(resolversDir, logger, resolverRegistry),
        loadCustomHooks(hooksDir, logger, hookInitializers),
        loadCustomSchemas({ schemasDir, logger, registry: schemaRegistry }),
      ])
    },

    getStackTemplateContents: async (
      stackPath: StackPath,
      variables: any,
      filepath: string,
      dynamic: boolean,
    ): Promise<string> => {
      const pathToTemplate = path.join(templatesDir, filepath)
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
    },

    templateEngine,
  })
}
