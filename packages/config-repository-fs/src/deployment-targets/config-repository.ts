import { ConfigSet, ConfigSetName } from "@takomo/config-sets"
import { CommandContext } from "@takomo/core"
import {
  buildDeploymentConfig,
  DeploymentConfig,
} from "@takomo/deployment-targets-config"
import { DeploymentTargetsConfigRepository } from "@takomo/deployment-targets-context"
import {
  createDeploymentTargetsSchemaRegistry,
  DeploymentGroupPath,
} from "@takomo/deployment-targets-model"
import {
  createDeploymentTargetConfigItemSchema,
  createDeploymentTargetRepositoryRegistry,
  createFileSystemDeploymentTargetRepositoryProvider,
  DeploymentTargetRepository,
} from "@takomo/deployment-targets-repository"
import { StacksConfigRepository } from "@takomo/stacks-context"
import { ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { ResolverRegistry } from "@takomo/stacks-resolvers"
import {
  arrayToMap,
  dirExists,
  FilePath,
  TakomoError,
  TemplateEngine,
  TkmLogger,
} from "@takomo/util"
import { basename, join } from "path"
import R from "ramda"
import readdirp from "readdirp"
import {
  createFileSystemStacksConfigRepository,
  FileSystemStacksConfigRepositoryProps,
} from "../stacks/config-repository"
import { parseConfigFile } from "./parser"

interface FileSystemDeploymentTargetsConfigRepositoryProps
  extends FileSystemStacksConfigRepositoryProps {
  readonly pathToDeploymentConfigFile?: FilePath
  readonly deploymentDir: FilePath
  readonly configSetsDir: FilePath
  readonly defaultDeploymentConfigFileName: string
}

const resolveConfigFilePath = (
  deploymentDir: FilePath,
  pathToConfigFile: FilePath,
): FilePath =>
  pathToConfigFile.startsWith("/")
    ? pathToConfigFile
    : join(deploymentDir, pathToConfigFile)

const initDeploymentTargetsRepository = async (
  ctx: CommandContext,
  logger: TkmLogger,
  templateEngine: TemplateEngine,
): Promise<DeploymentTargetRepository | undefined> => {
  if (ctx.projectConfig?.deploymentTargets?.repository === undefined) {
    return undefined
  }

  const registry = createDeploymentTargetRepositoryRegistry()
  registry.registerDeploymentTargetRepositoryProvider(
    "filesystem",
    createFileSystemDeploymentTargetRepositoryProvider(),
  )

  return registry.initDeploymentTargetRepository({
    logger,
    ctx,
    templateEngine,
    config: ctx.projectConfig.deploymentTargets.repository,
  })
}

const loadExternallyPersistedDeploymentTargets = async (
  ctx: CommandContext,
  logger: TkmLogger,
  templateEngine: TemplateEngine,
): Promise<Map<DeploymentGroupPath, ReadonlyArray<unknown>>> => {
  const repository = await initDeploymentTargetsRepository(
    ctx,
    logger,
    templateEngine,
  )

  if (!repository) {
    return new Map()
  }

  const deploymentTargets = await repository.listDeploymentTargets()

  const schema = createDeploymentTargetConfigItemSchema({
    regions: ctx.regions,
  })

  deploymentTargets.forEach((wrapper) => {
    const { error } = schema.validate(wrapper.item, { abortEarly: false })
    if (error) {
      const details = error.details.map((m) => `  - ${m.message}`).join("\n")
      throw new TakomoError(
        `Validation errors in deployment target configuration '${wrapper.source}':\n\n${details}`,
      )
    }
  })

  return new Map(
    Array.from(
      Object.entries(
        R.groupBy(
          (a) => a.deploymentGroupPath,
          deploymentTargets.map((w) => w.item),
        ),
      ),
    ),
  )
}

export const createFileSystemDeploymentTargetsConfigRepository = async (
  props: FileSystemDeploymentTargetsConfigRepositoryProps,
): Promise<DeploymentTargetsConfigRepository> => {
  const stacksConfigRepository = await createFileSystemStacksConfigRepository(
    props,
  )

  const {
    projectDir,
    defaultDeploymentConfigFileName,
    deploymentDir,
    configSetsDir,
    pathToDeploymentConfigFile,
    logger,
    ctx,
    stacksDir,
  } = props

  const hookInitializers = new Map()
  const resolverRegistry = new ResolverRegistry(logger)
  const schemaRegistry = createDeploymentTargetsSchemaRegistry(logger)

  await stacksConfigRepository.loadExtensions(
    resolverRegistry,
    hookInitializers,
    schemaRegistry,
  )

  const loadConfigSetsFromConfigSetsDir = async (): Promise<
    Map<ConfigSetName, ConfigSet>
  > => {
    const dirs = await readdirp.promise(configSetsDir, {
      alwaysStat: true,
      depth: 1,
      type: "directories",
    })

    return arrayToMap(
      dirs.map(R.prop("basename")).map((name) => ({
        name,
        description: "",
        vars: {},
        commandPaths: [ROOT_STACK_GROUP_PATH],
        legacy: false,
      })),
      R.prop("name"),
    )
  }

  return {
    ...stacksConfigRepository,
    createStacksConfigRepository: async (
      configSetName: ConfigSetName,
      legacy: boolean,
    ): Promise<StacksConfigRepository> => {
      const configSetStacksDir = legacy
        ? stacksDir
        : join(configSetsDir, configSetName)

      if (!(await dirExists(configSetStacksDir))) {
        throw new Error(`Config set directory not found: ${configSetStacksDir}`)
      }

      return createFileSystemStacksConfigRepository({
        ...props,
        stacksDir: configSetStacksDir,
      })
    },
    getDeploymentConfig: async (): Promise<DeploymentConfig> => {
      if (!(await dirExists(deploymentDir))) {
        throw new TakomoError(
          `Takomo deployment dir '${basename(
            deploymentDir,
          )}' not found from the project dir ${projectDir}`,
        )
      }

      const configFile = pathToDeploymentConfigFile
        ? resolveConfigFilePath(deploymentDir, pathToDeploymentConfigFile)
        : join(deploymentDir, defaultDeploymentConfigFileName)

      const parsedFile = await parseConfigFile(
        ctx,
        logger,
        stacksConfigRepository.templateEngine,
        configFile,
      )

      const externalDeploymentTargets = await loadExternallyPersistedDeploymentTargets(
        ctx,
        logger,
        stacksConfigRepository.templateEngine,
      )

      const externalConfigSets = await loadConfigSetsFromConfigSetsDir()

      const result = await buildDeploymentConfig(
        ctx,
        logger,
        schemaRegistry,
        externalDeploymentTargets,
        externalConfigSets,
        parsedFile,
      )
      if (result.isOk()) {
        return result.value
      }

      const details = result.error.messages.map((m) => `  - ${m}`).join("\n")
      throw new TakomoError(
        `Validation errors in deployment targets configuration file ${configFile}:\n\n${details}`,
      )
    },
  }
}
