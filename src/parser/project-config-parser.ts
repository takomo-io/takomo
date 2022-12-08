import Joi from "joi"
import { dirname } from "path"
import R from "ramda"
import semver from "semver"
import { Region } from "../aws/common/model"
import {
  defaultEsbuild,
  defaultFeatures,
  EsbuildConfig,
  ExternalHandlebarsHelperConfig,
  ExternalResolverConfig,
  Features,
  InternalTakomoProjectConfig,
  TakomoProjectDeploymentTargetsConfig,
} from "../config/project-config"
import { DEFAULT_REGIONS } from "../constants/regions-constants"
import { createCommonSchema } from "../schema/common-schema"
import { mergeArrays } from "../utils/collections"
import { TakomoError } from "../utils/errors"
import { expandFilePath, fileExists, FilePath } from "../utils/files"
import { parseYamlFile } from "../utils/yaml"
import {
  parseOptionalBoolean,
  parseString,
  parseStringArray,
} from "./common-parser"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require("../../package.json")

const validateRequiredVersion = (
  configFilePath: string,
  requiredVersion?: string,
): void => {
  if (!requiredVersion) {
    return
  }

  if (!semver.satisfies(version, requiredVersion)) {
    throw new TakomoError(
      `Current Takomo version ${version} does not satisfy the required version range ` +
        `${requiredVersion} specified in the project configuration file ${configFilePath}`,
      {
        instructions: ["Upgrade Takomo to satisfy the version requirement"],
      },
    )
  }
}

export const parseExternalResolver = (value: any): ExternalResolverConfig => {
  if (typeof value === "string") {
    return {
      package: value,
    }
  }

  return {
    name: value.name,
    package: value.package,
  }
}

export const parseExternalHandlebarsHelper = (
  value: any,
): ExternalHandlebarsHelperConfig => {
  if (typeof value === "string") {
    return {
      package: value,
    }
  }

  return {
    name: value.name,
    package: value.package,
  }
}

export const parseExternalHandlebarsHelpers = (
  value: any,
): ReadonlyArray<ExternalHandlebarsHelperConfig> => {
  if (value === null || value === undefined) {
    return []
  }

  if (!Array.isArray(value)) {
    throw new Error("Expected helpers to be an array")
  }

  return value.map(parseExternalHandlebarsHelper)
}

const parseFilePaths = (
  projectDir: FilePath,
  value: unknown,
): ReadonlyArray<FilePath> =>
  parseStringArray(value).map((f) => expandFilePath(projectDir, f))

export const parseExternalResolvers = (
  value: any,
): ReadonlyArray<ExternalResolverConfig> => {
  if (value === null || value === undefined) {
    return []
  }

  if (!Array.isArray(value)) {
    throw new Error("Expected resolvers to be an array")
  }

  return value.map(parseExternalResolver)
}

export const parseFeatures = (value: any): Features => {
  const defaults = defaultFeatures()
  if (value === null || value === undefined) {
    return defaults
  }

  return { ...defaults, ...value }
}

export const parseDeploymentTargetsConfig = (
  value: any,
): TakomoProjectDeploymentTargetsConfig | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  const repository = value.repository
  if (!repository) {
    return {}
  }

  if (Array.isArray(repository)) {
    return {
      repository,
    }
  }

  return {
    repository: [repository],
  }
}

const parseEsbuildConfig = (
  projectDir: FilePath,
  value: any,
): EsbuildConfig | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  const defaultValue = defaultEsbuild(projectDir)

  return {
    enabled: parseOptionalBoolean(value.enabled) ?? true,
    outFile: expandFilePath(
      projectDir,
      parseString(value.outDir, defaultValue.outFile),
    ),
    entryPoint: expandFilePath(
      projectDir,
      parseString(value.entryPoint, defaultValue.entryPoint),
    ),
  }
}

interface ConfigFileItem {
  readonly absolutePath: FilePath
  readonly contents: any
}

export const parseProjectConfigItem = (
  projectDir: FilePath,
  { absolutePath, contents }: ConfigFileItem,
  parentConfig: InternalTakomoProjectConfig,
): InternalTakomoProjectConfig => {
  const { error } = takomoProjectConfigFileSchema.validate(contents, {
    abortEarly: false,
    convert: false,
  })
  if (error) {
    const details = error.details.map((d) => `  - ${d.message}`).join("\n")
    throw new TakomoError(
      `${error.details.length} validation error(s) in project config file ${absolutePath}:\n\n${details}`,
    )
  }

  const dirPath = dirname(absolutePath)

  const regions = contents.regions ?? []
  const resolvers = parseExternalResolvers(contents.resolvers)
  const helpers = parseExternalHandlebarsHelpers(contents.helpers)
  const features = parseFeatures(contents.features)
  const varFiles = parseFilePaths(dirPath, contents.varFiles)
  const helpersDir = parseFilePaths(dirPath, contents.helpersDir)
  const partialsDir = parseFilePaths(dirPath, contents.partialsDir)
  const schemasDir = parseFilePaths(dirPath, contents.schemasDir)
  const deploymentTargets = parseDeploymentTargetsConfig(
    contents.deploymentTargets,
  )

  const esbuild = parseEsbuildConfig(dirPath, contents.esbuild)

  return {
    regions: mergeArrays({ first: parentConfig.regions, second: regions }),
    resolvers: mergeArrays({
      first: parentConfig.resolvers,
      second: resolvers,
      equals: (a, b) => a.package === b.package && a.name === b.name,
    }),
    helpers: mergeArrays({
      first: parentConfig.helpers,
      second: helpers,
      equals: (a, b) => a.package === b.package && a.name === b.name,
    }),
    helpersDir: mergeArrays({
      first: parentConfig.helpersDir,
      second: helpersDir,
    }),
    partialsDir: mergeArrays({
      first: parentConfig.partialsDir,
      second: partialsDir,
    }),
    schemasDir: mergeArrays({
      first: parentConfig.schemasDir,
      second: schemasDir,
    }),
    features: { ...parentConfig.features, ...features },
    varFiles: mergeArrays({ first: parentConfig.varFiles, second: varFiles }),
    requiredVersion: contents.requiredVersion ?? parentConfig.requiredVersion,
    deploymentTargets: deploymentTargets ?? parentConfig.deploymentTargets,
    esbuild: esbuild ?? parentConfig.esbuild,
  }
}

export const collectProjectConfigFileHierarchy = async (
  projectDir: FilePath,
  pathConfigFile: FilePath,
  collected: ReadonlyArray<ConfigFileItem> = [],
  referencingConfigFilePath?: FilePath,
): Promise<ReadonlyArray<ConfigFileItem>> => {
  const absolutePath = expandFilePath(projectDir, pathConfigFile)

  if (collected.some((i) => i.absolutePath === absolutePath)) {
    const filePaths = collected.map((p) => p.absolutePath).join(" -> ")
    throw new TakomoError(
      `Circular inheritance of project config files detected: ${filePaths} -> ${absolutePath}`,
    )
  }

  if (!(await fileExists(absolutePath))) {
    if (referencingConfigFilePath) {
      throw new TakomoError(
        `Project config file ${absolutePath} not found. It's referenced in file ${referencingConfigFilePath}`,
      )
    } else {
      throw new TakomoError(`Project config file ${absolutePath} not found`)
    }
  }

  const contents = (await parseYamlFile(absolutePath)) ?? {}
  const pair = { absolutePath, contents }
  if (!contents.extends) {
    return [...collected, pair]
  }

  if (typeof contents.extends !== "string") {
    throw new TakomoError(
      `Expected property 'extends' to be a string in file ${absolutePath}`,
    )
  }

  return collectProjectConfigFileHierarchy(
    projectDir,
    contents.extends,
    [...collected, pair],
    absolutePath,
  )
}

const { variableName } = createCommonSchema()

const deploymentTargetRepositoryType = Joi.string()
  .min(1)
  .max(40)
  .regex(/^[a-zA-Z0-9-_]+$/)

const deploymentTargetRepository = Joi.object({
  type: deploymentTargetRepositoryType.required(),
}).unknown(true)

const deploymentTargetRepositoryWithId = deploymentTargetRepository.keys({
  id: Joi.string().required(),
})

const externalResolver = Joi.object({
  name: variableName,
}).unknown(true)

const externalHandlebarsHelper = Joi.object({
  name: variableName,
}).unknown(true)

const features = Joi.object({
  deploymentTargetsUndeploy: Joi.boolean(),
  deploymentTargetsTearDown: Joi.boolean(),
})

const varFiles = [Joi.string(), Joi.array().items(Joi.string())]

const esbuild = Joi.object({
  enabled: Joi.boolean(),
  outDir: Joi.string(),
  entryPoint: Joi.string(),
})

export const takomoProjectConfigFileSchema = Joi.object({
  extends: Joi.string(),
  requiredVersion: Joi.string(),
  deploymentTargets: Joi.object({
    repository: [
      deploymentTargetRepository,
      Joi.array().items(deploymentTargetRepositoryWithId).unique("id"),
    ],
  }),
  regions: Joi.array().items(Joi.string()).unique(),
  resolvers: Joi.array().items(Joi.string(), externalResolver),
  helpers: Joi.array().items(Joi.string(), externalHandlebarsHelper),
  helpersDir: [Joi.string(), Joi.array().items(Joi.string())],
  partialsDir: [Joi.string(), Joi.array().items(Joi.string())],
  schemasDir: [Joi.string(), Joi.array().items(Joi.string())],
  varFiles,
  features,
  esbuild,
})

const createDefaultProjectConfig = (
  regions: ReadonlyArray<Region>,
  projectDir: FilePath,
): InternalTakomoProjectConfig => ({
  regions,
  resolvers: [],
  helpers: [],
  helpersDir: [],
  partialsDir: [],
  schemasDir: [],
  varFiles: [],
  features: defaultFeatures(),
  esbuild: defaultEsbuild(projectDir),
})

const parseProjectConfigFiles = async (
  projectDir: FilePath,
  [currentItem, ...rest]: ReadonlyArray<ConfigFileItem>,
  projectConfig: InternalTakomoProjectConfig,
): Promise<InternalTakomoProjectConfig> => {
  if (!currentItem) {
    return projectConfig
  }

  const updatedProjectConfig = parseProjectConfigItem(
    projectDir,
    currentItem,
    projectConfig,
  )

  return parseProjectConfigFiles(projectDir, rest, updatedProjectConfig)
}

export const loadProjectConfig = async (
  projectDir: FilePath,
  pathConfigFile: FilePath,
  overrideFeatures: Partial<Features>,
): Promise<InternalTakomoProjectConfig> => {
  if (!(await fileExists(pathConfigFile))) {
    return createDefaultProjectConfig(DEFAULT_REGIONS.slice(), projectDir)
  }

  const projectConfigItems = await collectProjectConfigFileHierarchy(
    projectDir,
    pathConfigFile,
  )

  const projectConfig = await parseProjectConfigFiles(
    projectDir,
    projectConfigItems.slice().reverse(),
    createDefaultProjectConfig([], projectDir),
  )

  validateRequiredVersion(pathConfigFile, projectConfig.requiredVersion)

  const setOverrideFeatures = (
    cfg: InternalTakomoProjectConfig,
  ): InternalTakomoProjectConfig => ({
    ...cfg,
    features: Object.entries(overrideFeatures).reduce(
      (collected, [key, value]) => {
        return {
          ...collected,
          [key]: value,
        }
      },
      cfg.features,
    ),
  })

  const setDefaultRegionsIfNeeded = (
    cfg: InternalTakomoProjectConfig,
  ): InternalTakomoProjectConfig =>
    cfg.regions.length === 0
      ? {
          ...cfg,
          regions: DEFAULT_REGIONS.slice(),
        }
      : cfg

  return R.pipe(setDefaultRegionsIfNeeded, setOverrideFeatures)(projectConfig)
}
