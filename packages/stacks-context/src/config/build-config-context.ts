import {
  CommandPath,
  Constants,
  IamRoleArn,
  initDefaultCredentialProvider,
  Options,
  TakomoCredentialProvider,
  Variables,
} from "@takomo/core"
import {
  coreResolverProviders,
  ResolverRegistry,
} from "@takomo/stacks-resolvers"
import {
  dirExists,
  FilePath,
  Logger,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import path from "path"
import { collectStackGroups } from "./collect-stack-groups"
import { collectStacks } from "./collect-stacks"
import { ConfigContext } from "./config-context"
import { loadExtensions } from "./extensions"
import { coreHookInitializers } from "./hooks"
import { processConfigTree } from "./process-config-tree"
import { buildConfigTree } from "./tree/build-config-tree"

export interface BuildConfigContextInput {
  options: Options
  variables: Variables
  logger: Logger
  overrideCredentialProvider?: TakomoCredentialProvider
  commandPath?: CommandPath
}

const resolveStacksDirPath = async (
  projectDir: FilePath,
): Promise<FilePath> => {
  const stacksDirPath = path.join(projectDir, Constants.STACKS_DIR)
  if (!(await dirExists(stacksDirPath))) {
    throw new TakomoError(
      `Takomo stacks dir ${Constants.STACKS_DIR} not found from the project dir ${projectDir}`,
    )
  }

  return stacksDirPath
}

const resolveTemplatesDirPath = async (
  projectDir: FilePath,
): Promise<FilePath> => {
  const templatesDirPath = path.join(projectDir, Constants.TEMPLATES_DIR)
  if (!(await dirExists(templatesDirPath))) {
    throw new TakomoError(
      `Takomo templates dir ${Constants.TEMPLATES_DIR} not found from the project dir ${projectDir}`,
    )
  }

  return templatesDirPath
}

export const buildConfigContext = async ({
  options,
  variables,
  logger,
  overrideCredentialProvider,
  commandPath,
}: BuildConfigContextInput): Promise<ConfigContext> => {
  const credentialProvider =
    overrideCredentialProvider ||
    (await initDefaultCredentialProvider(options.getCredentials()))

  logger.info("Build configuration")
  const projectDir = options.getProjectDir()
  logger.debug(`Current project dir: ${projectDir}`)

  const stacksDirPath = await resolveStacksDirPath(projectDir)
  const templatesDirPath = await resolveTemplatesDirPath(projectDir)

  const templateEngine = new TemplateEngine()
  const hookInitializers = coreHookInitializers()

  const resolverRegistry = new ResolverRegistry(logger)
  coreResolverProviders().forEach((p) =>
    resolverRegistry.registerBuiltInProvider(p),
  )

  await loadExtensions(
    projectDir,
    logger,
    resolverRegistry,
    hookInitializers,
    templateEngine,
  )

  const configTree = await buildConfigTree(
    logger,
    stacksDirPath,
    Constants.ROOT_STACK_GROUP_PATH,
  )

  const credentialProviders = new Map<IamRoleArn, TakomoCredentialProvider>()

  const rootStackGroup = await processConfigTree(
    logger,
    credentialProvider,
    credentialProviders,
    resolverRegistry,
    hookInitializers,
    options,
    variables,
    templateEngine,
    commandPath || Constants.ROOT_STACK_GROUP_PATH,
    configTree,
  )

  const stackGroups = collectStackGroups(rootStackGroup)
  const stacks = collectStacks(stackGroups)
  const stackConfigsByPath = new Map(stacks.map((s) => [s.getPath(), s]))

  return new ConfigContext({
    rootStackGroup,
    credentialProvider,
    options,
    variables,
    logger,
    stacksByPath: stackConfigsByPath,
    templateEngine,
    stackGroups,
  })
}
