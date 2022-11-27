import { basename, join } from "path"
import R from "ramda"
import { createHookRegistry } from "../../hooks/hook-registry"
import { ResolverRegistry } from "../../resolvers/resolver-registry"
import { CredentialManager } from "../../takomo-aws-clients"
import {
  createDeploymentTargetConfigItemSchema,
  createDeploymentTargetRepositoryRegistry,
  createFileSystemDeploymentTargetRepositoryProvider,
  createOrganizationDeploymentTargetRepositoryProvider,
  DeploymentTargetRepository,
} from "../../takomo-deployment-targets-repository"
import { StacksConfigRepository } from "../../takomo-stacks-context"

import { Cache } from "../../caches/cache"
import { ConfigSetName } from "../../config-sets/config-set-model"
import { DeploymentConfig } from "../../config/targets-config"
import { InternalCommandContext } from "../../context/command-context"
import { DeploymentTargetsConfigRepository } from "../../context/targets-context"
import { buildDeploymentConfig } from "../../parser/targets/build-deployment-config"
import {
  createDeploymentTargetsSchemaRegistry,
  DeploymentGroupPath,
} from "../../targets/targets-model"
import { TakomoError } from "../../utils/errors"
import { dirExists, FilePath } from "../../utils/files"
import { TkmLogger } from "../../utils/logging"
import { TemplateEngine } from "../../utils/templating"
import { createFileSystemCache } from "../cache"
import { loadConfigSetsFromConfigSetsDir } from "../config-sets/config-sets-loader"
import {
  createFileSystemStacksConfigRepository,
  FileSystemStacksConfigRepositoryProps,
} from "../stacks/config-repository"
import { mergeDeploymentTargetConfigs } from "./merge-deployment-target-configs"
import { parseConfigFile } from "./parser"

interface FileSystemDeploymentTargetsConfigRepositoryProps
  extends FileSystemStacksConfigRepositoryProps {
  readonly pathToDeploymentConfigFile?: FilePath
  readonly deploymentDir: FilePath
  readonly configSetsDir: FilePath
  readonly defaultDeploymentConfigFileName: string
  readonly credentialManager: CredentialManager
}

const resolveConfigFilePath = (
  deploymentDir: FilePath,
  pathToConfigFile: FilePath,
): FilePath =>
  pathToConfigFile.startsWith("/")
    ? pathToConfigFile
    : join(deploymentDir, pathToConfigFile)

const initDeploymentTargetsRepositories = async (
  ctx: InternalCommandContext,
  logger: TkmLogger,
  templateEngine: TemplateEngine,
  credentialManager: CredentialManager,
  cache: Cache,
): Promise<ReadonlyArray<DeploymentTargetRepository>> => {
  const repositoryConfigs =
    ctx.projectConfig?.deploymentTargets?.repository ?? []

  if (repositoryConfigs.length === 0) {
    return []
  }

  const registry = createDeploymentTargetRepositoryRegistry()
  registry.registerDeploymentTargetRepositoryProvider(
    "filesystem",
    createFileSystemDeploymentTargetRepositoryProvider(),
  )

  registry.registerDeploymentTargetRepositoryProvider(
    "organization",
    createOrganizationDeploymentTargetRepositoryProvider(),
  )

  return Promise.all(
    repositoryConfigs.map((config) =>
      registry.initDeploymentTargetRepository({
        logger,
        ctx,
        templateEngine,
        config,
        credentialManager,
        cache,
      }),
    ),
  )
}

const loadExternallyPersistedDeploymentTargets = async (
  ctx: InternalCommandContext,
  logger: TkmLogger,
  templateEngine: TemplateEngine,
  credentialManager: CredentialManager,
  cache: Cache,
): Promise<Map<DeploymentGroupPath, ReadonlyArray<unknown>>> => {
  const repositories = await initDeploymentTargetsRepositories(
    ctx,
    logger,
    templateEngine,
    credentialManager,
    cache,
  )

  if (repositories.length === 0) {
    return new Map()
  }

  const deploymentTargetsList = await Promise.all(
    repositories.map((r) => r.listDeploymentTargets()),
  )

  const deploymentTargets = deploymentTargetsList.flat()

  const schema = createDeploymentTargetConfigItemSchema({
    regions: ctx.regions,
  })

  deploymentTargets.forEach((wrapper) => {
    const { error } = schema.validate(wrapper.item, {
      abortEarly: false,
      convert: false,
    })
    if (error) {
      const details = error.details.map((m) => `  - ${m.message}`).join("\n")
      throw new TakomoError(
        `Validation errors in deployment target configuration '${wrapper.source}':\n\n${details}`,
      )
    }
  })

  const mergedDeploymentTargets = mergeDeploymentTargetConfigs(
    deploymentTargets.map(R.prop("item")),
  )

  return new Map(
    Array.from(
      Object.entries(
        R.groupBy(R.prop("deploymentGroupPath"), mergedDeploymentTargets),
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
    credentialManager,
    cacheDir,
  } = props

  const cache = createFileSystemCache(logger, cacheDir)
  if (ctx.resetCache) {
    await cache.reset()
  }

  const hookRegistry = createHookRegistry({ logger })
  const resolverRegistry = new ResolverRegistry(logger)
  const schemaRegistry = createDeploymentTargetsSchemaRegistry(logger)

  await stacksConfigRepository.loadExtensions(
    resolverRegistry,
    hookRegistry,
    schemaRegistry,
  )

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

      const externalDeploymentTargets =
        await loadExternallyPersistedDeploymentTargets(
          ctx,
          logger,
          stacksConfigRepository.templateEngine,
          credentialManager,
          cache,
        )

      const externalConfigSets = await loadConfigSetsFromConfigSetsDir(
        configSetsDir,
      )

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

      const details = result.error.messages
        .map((m: unknown) => `  - ${m}`)
        .join("\n")
      throw new TakomoError(
        `Validation errors in deployment targets configuration file ${configFile}:\n\n${details}`,
      )
    },
  }
}
