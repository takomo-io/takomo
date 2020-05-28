import {
  CommandRole,
  Constants,
  IamRoleArn,
  initDefaultCredentialProvider,
  Options,
  Project,
  stackGroupName,
  StackGroupPath,
  StackName,
  stackName,
  StackPath,
  TakomoCredentialProvider,
  Variables,
} from "@takomo/core"
import {
  parseStackConfigFile,
  parseStackGroupConfigFile,
} from "@takomo/stacks-config"
import { HookInitializersMap, Stack, StackGroup } from "@takomo/stacks-model"
import {
  coreResolverProviders,
  ResolverRegistry,
} from "@takomo/stacks-resolvers"
import {
  dirExists,
  fileExists,
  Logger,
  mapToObject,
  TakomoError,
  TemplateEngine,
  validate,
} from "@takomo/util"
import flatten from "lodash.flatten"
import uniq from "lodash.uniq"
import path from "path"
import readdirp from "readdirp"
import {
  checkCyclicDependencies,
  processStackDependencies,
} from "../dependencies"
import { loadExtensions } from "./extensions"
import { coreHookInitializers, initializeHooks } from "./hooks"
import { ConfigContext } from "./model"
import { buildParameters } from "./parameters"
import { buildSecrets, makeSecretsPath } from "./secrets"

export const createRootStackGroup = (): StackGroup =>
  new StackGroup({
    name: Constants.ROOT_STACK_GROUP_PATH,
    isRoot: true,
    regions: [],
    commandRole: null,
    project: null,
    timeout: null,
    templateBucket: null,
    tags: new Map(),
    path: Constants.ROOT_STACK_GROUP_PATH,
    children: new Array<StackGroup>(),
    stacks: new Array<Stack>(),
    data: {},
    hooks: [],
    capabilities: null,
    accountIds: [],
    ignore: false,
  })

export const makeStackGroupPath = (
  dirPath: string,
  parent: StackGroup,
): StackGroupPath => {
  const dirName = path.basename(dirPath)
  return parent.isRoot() ? `/${dirName}` : `${parent.getPath()}/${dirName}`
}

const makeStackName = (
  stackPath: StackPath,
  project: Project | null,
): StackName => {
  const prefix = project ? `${project}-` : ""
  const cleanedStackPath = stackPath.substr(1)
  return `${prefix}${cleanedStackPath}`
    .replace(/\//g, "-")
    .replace(/\.yml$/, "")
}

const makeStackPath = (filename: string, stackGroup: StackGroup): StackPath =>
  stackGroup.isRoot() ? `/${filename}` : `${stackGroup.getPath()}/${filename}`

const collectStackGroups = (
  stackGroup: StackGroup,
  stackGroups: Map<StackGroupPath, StackGroup> = new Map(),
): Map<StackGroupPath, StackGroup> => {
  stackGroups.set(stackGroup.getPath(), stackGroup)
  stackGroup
    .getChildren()
    .forEach((child) => collectStackGroups(child, stackGroups))
  return stackGroups
}

const collectStacks = (stackGroups: Map<StackGroupPath, StackGroup>): Stack[] =>
  Array.from(stackGroups.values()).reduce(
    (collected, stackGroup) => [...collected, ...stackGroup.getStacks()],
    new Array<Stack>(),
  )

const getCredentialProvider = async (
  commandRole: CommandRole | null,
  defaultCredentialProvider: TakomoCredentialProvider,
  credentialProviders: Map<IamRoleArn, TakomoCredentialProvider>,
): Promise<TakomoCredentialProvider> => {
  if (!commandRole) {
    return defaultCredentialProvider
  }

  const credentialProvider = credentialProviders.get(commandRole.iamRoleArn)
  if (credentialProvider) {
    return credentialProvider
  }

  const newCredentialProvider = await defaultCredentialProvider.createCredentialProviderForRole(
    commandRole.iamRoleArn,
  )

  credentialProviders.set(commandRole.iamRoleArn, newCredentialProvider)
  return newCredentialProvider
}

export const createVariablesForStackConfigFile = (
  variables: Variables,
  stackGroup: StackGroup,
): any => {
  const stackGroupVariables = {
    name: stackGroup.getName(),
    project: stackGroup.getProject(),
    regions: stackGroup.getRegions(),
    commandRole: stackGroup.getCommandRole(),
    path: stackGroup.getPath(),
    isRoot: stackGroup.isRoot(),
    templateBucket: stackGroup.getTemplateBucket(),
    timeout: stackGroup.getTimeout(),
    tags: mapToObject(stackGroup.getTags()),
    data: stackGroup.getData(),
    capabilities: stackGroup.getCapabilities(),
    accountIds: stackGroup.getAccountIds(),
  }

  return {
    ...variables,
    stackGroup: stackGroupVariables,
  }
}

const buildStack = async (
  logger: Logger,
  defaultCredentialProvider: TakomoCredentialProvider,
  credentialsProviders: Map<IamRoleArn, TakomoCredentialProvider>,
  resolverRegistry: ResolverRegistry,
  hookInitializers: HookInitializersMap,
  options: Options,
  variables: Variables,
  filePath: string,
  stackGroup: StackGroup,
  templateEngine: TemplateEngine,
): Promise<Stack[]> => {
  const filename = path.basename(filePath)
  const stackPath = makeStackPath(filename, stackGroup)
  const stackVariables = createVariablesForStackConfigFile(
    variables,
    stackGroup,
  )

  const stackConfig = await parseStackConfigFile(
    logger.childLogger(stackPath),
    options,
    stackVariables,
    filePath,
    templateEngine,
  )

  const name =
    stackConfig.name ||
    makeStackName(stackPath, stackConfig.project || stackGroup.getProject())

  const regions =
    stackConfig.regions.length > 0
      ? stackConfig.regions
      : stackGroup.getRegions()

  if (regions.length === 0) {
    throw new TakomoError(`Stack ${stackPath} has no regions`)
  }

  const template =
    stackConfig.template || `${stackGroup.getPath().slice(1)}/${filename}`

  validate(stackName, name, `Name of stack ${stackPath} is not valid`)

  if (!template) {
    throw new TakomoError(`Stack ${stackPath} has no template`)
  }

  const parameters = await buildParameters(
    stackConfig.parameters,
    resolverRegistry,
  )

  uniq(
    flatten(
      Array.from(parameters.values()).reduce((collected, parameter) => {
        return [...collected, parameter.getIamRoleArns()]
      }, new Array<string[]>()),
    ),
  )
    .map((iamRoleArn) => ({ iamRoleArn }))
    .forEach((commandRole) => {
      getCredentialProvider(
        commandRole,
        defaultCredentialProvider,
        credentialsProviders,
      )
    })

  const accountIds = stackConfig.accountIds || stackGroup.getAccountIds()
  const hookConfigs = [...stackGroup.getHooks(), ...stackConfig.hooks]
  const hooks = await initializeHooks(hookConfigs, hookInitializers)

  const commandRole = stackConfig.commandRole || stackGroup.getCommandRole()
  const credentialProvider = await getCredentialProvider(
    commandRole,
    defaultCredentialProvider,
    credentialsProviders,
  )

  const capabilities = stackConfig.capabilities || stackGroup.getCapabilities()
  const ignore =
    stackConfig.ignore !== null ? stackConfig.ignore : stackGroup.isIgnored()

  return regions.map((region) => {
    const exactPath = `${stackPath}/${region}`
    const secretsPath = makeSecretsPath(
      exactPath,
      stackConfig.project || stackGroup.getProject(),
    )

    const props = {
      name,
      template,
      secretsPath,
      region,
      parameters,
      commandRole,
      credentialProvider,
      hooks,
      ignore,
      path: exactPath,
      project: stackConfig.project || stackGroup.getProject(),
      tags: stackGroup.getTags(),
      timeout: stackConfig.timeout ||
        stackGroup.getTimeout() || { create: 0, update: 0 },
      dependencies: stackConfig.depends,
      dependants: [],
      templateBucket:
        stackConfig.templateBucket || stackGroup.getTemplateBucket(),
      data: stackGroup.getData(),
      secrets: buildSecrets(secretsPath, stackConfig.secrets),
      capabilities,
      accountIds,
    }

    stackConfig.tags.forEach((value, key) => {
      props.tags.set(key, value)
    })

    props.data = { ...props.data, ...stackConfig.data }

    return new Stack(props)
  })
}

const populatePropertiesFromConfigFile = async (
  logger: Logger,
  options: Options,
  variables: Variables,
  stackGroup: StackGroup,
  dirPath: string,
  templateEngine: TemplateEngine,
): Promise<StackGroup> => {
  const configFilePath = `${dirPath}/${Constants.STACK_GROUP_CONFIG_FILE}`
  if (!(await fileExists(configFilePath))) {
    return stackGroup
  }

  const configFile = await parseStackGroupConfigFile(
    logger.childLogger(stackGroup.getPath()),
    options,
    variables,
    configFilePath,
    templateEngine,
  )

  const props = stackGroup.toProps()

  if (configFile.project) {
    props.project = configFile.project
  }

  if (configFile.templateBucket) {
    props.templateBucket = configFile.templateBucket
  }

  if (configFile.regions.length > 0) {
    props.regions = configFile.regions
  }

  if (configFile.commandRole) {
    props.commandRole = configFile.commandRole
  }

  if (configFile.capabilities) {
    props.capabilities = configFile.capabilities
  }

  if (configFile.accountIds) {
    props.accountIds = configFile.accountIds
  }

  if (configFile.ignore !== null) {
    props.ignore = configFile.ignore
  }

  if (configFile.timeout !== null) {
    props.timeout = configFile.timeout
  }

  configFile.tags.forEach((value, key) => {
    props.tags.set(key, value)
  })

  props.data = { ...stackGroup.getData(), ...configFile.data }
  props.hooks = [...stackGroup.getHooks(), ...configFile.hooks]

  return new StackGroup(props)
}

export const createStackGroupFromParent = (
  dirPath: string,
  parent: StackGroup,
): StackGroup =>
  new StackGroup({
    name: path.basename(dirPath),
    isRoot: false,
    regions: parent.getRegions(),
    commandRole: parent.getCommandRole(),
    project: parent.getProject(),
    timeout: parent.getTimeout(),
    templateBucket: parent.getTemplateBucket(),
    tags: parent.getTags(),
    path: makeStackGroupPath(dirPath, parent),
    children: new Array<StackGroup>(),
    stacks: new Array<Stack>(),
    data: parent.getData(),
    hooks: parent.getHooks(),
    capabilities: parent.getCapabilities(),
    accountIds: parent.getAccountIds(),
    ignore: parent.isIgnored(),
  })

const createStackGroup = async (
  logger: Logger,
  options: Options,
  variables: Variables,
  dirPath: string,
  parent: StackGroup | null,
  templateEngine: TemplateEngine,
): Promise<StackGroup> => {
  const stackGroupConfig = parent
    ? createStackGroupFromParent(dirPath, parent)
    : createRootStackGroup()

  return populatePropertiesFromConfigFile(
    logger,
    options,
    variables,
    stackGroupConfig,
    dirPath,
    templateEngine,
  )
}

export const buildStackGroup = async (
  logger: Logger,
  credentialProvider: TakomoCredentialProvider,
  credentialsProviders: Map<IamRoleArn, TakomoCredentialProvider>,
  resolverRegistry: ResolverRegistry,
  hookInitializers: HookInitializersMap,
  options: Options,
  variables: Variables,
  dirPath: string,
  parent: StackGroup | null,
  templateEngine: TemplateEngine,
): Promise<StackGroup> => {
  validate(
    stackGroupName,
    path.basename(dirPath),
    `Directory ${dirPath} name is not suitable for a stack group`,
  )

  const stackGroup = await createStackGroup(
    logger,
    options,
    variables,
    dirPath,
    parent,
    templateEngine,
  )

  if (stackGroup.isIgnored()) {
    logger.debug(
      `Stack group ${stackGroup.getPath()} marked as ignored, stop loading stacks child groups and stacks`,
    )
    return stackGroup
  }

  const files = await readdirp.promise(dirPath, {
    alwaysStat: true,
    depth: 0,
    fileFilter: (e) => e.basename.endsWith(Constants.CONFIG_FILE_EXTENSION),
    type: "files_directories",
  })

  const stackGroupDirs = files.filter((f) => f.stats!.isDirectory())

  const props = stackGroup.toProps()

  props.children = await Promise.all(
    stackGroupDirs.map(async (stackGroupDir) => {
      return await buildStackGroup(
        logger,
        credentialProvider,
        credentialsProviders,
        resolverRegistry,
        hookInitializers,
        options,
        variables,
        stackGroupDir.fullPath,
        stackGroup,
        templateEngine,
      )
    }),
  )

  const stackFiles = files.filter(
    (f) =>
      f.stats!.isFile() && f.basename !== Constants.STACK_GROUP_CONFIG_FILE,
  )
  const stacks = await Promise.all(
    stackFiles.map(async (stackFile) => {
      return await buildStack(
        logger,
        credentialProvider,
        credentialsProviders,
        resolverRegistry,
        hookInitializers,
        options,
        variables,
        stackFile.fullPath,
        stackGroup,
        templateEngine,
      )
    }),
  )

  props.stacks = flatten(stacks).filter((s) => !s.isIgnored())

  return new StackGroup(props)
}

export const buildConfigContext = async (
  options: Options,
  variables: Variables,
  logger: Logger,
  overrideDefaultCredentialProvider: TakomoCredentialProvider | null = null,
): Promise<ConfigContext> => {
  const credentialProvider =
    overrideDefaultCredentialProvider || (await initDefaultCredentialProvider())

  logger.info("Build configuration")
  const projectDir = options.getProjectDir()
  logger.debug(`Current project dir: ${projectDir}`)

  const rootConfigDirPath = path.join(projectDir, Constants.STACKS_DIR)
  if (!(await dirExists(rootConfigDirPath))) {
    throw new TakomoError(
      `Takomo stacks dir ${Constants.STACKS_DIR} not found from the project dir ${projectDir}`,
    )
  }

  const rootTemplatesDirPath = path.join(projectDir, Constants.TEMPLATES_DIR)
  if (!(await dirExists(rootTemplatesDirPath))) {
    throw new TakomoError(
      `Takomo templates dir ${Constants.TEMPLATES_DIR} not found from the project dir ${projectDir}`,
    )
  }

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

  const credentialProviders = new Map<IamRoleArn, TakomoCredentialProvider>()

  const rootStackGroup = await buildStackGroup(
    logger,
    credentialProvider,
    credentialProviders,
    resolverRegistry,
    hookInitializers,
    options,
    variables,
    rootConfigDirPath,
    null,
    templateEngine,
  )

  const stackGroups = collectStackGroups(rootStackGroup)
  const allStacks = collectStacks(stackGroups)
  const stacks = processStackDependencies(allStacks)
  const stackConfigsByPath = new Map(stacks.map((s) => [s.getPath(), s]))

  checkCyclicDependencies(stackConfigsByPath)

  return new ConfigContext({
    rootStackGroup,
    credentialProvider,
    options,
    variables,
    logger,
    stackConfigsByPath,
    templateEngine,
    stackGroups,
  })
}
