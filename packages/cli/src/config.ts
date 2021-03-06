import {
  createCommonSchema,
  defaultFeatures,
  ExternalHandlebarsHelperConfig,
  ExternalResolverConfig,
  Features,
  InternalTakomoProjectConfig,
  parseStringArray,
} from "@takomo/core"
import {
  fileExists,
  FilePath,
  parseYaml,
  readFileContents,
  TakomoError,
} from "@takomo/util"
import Joi from "joi"
import semver from "semver"
import { DEFAULT_REGIONS } from "./constants"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require("../package.json")

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

export const parseProjectConfigFile = async (
  path: FilePath,
  overrideFeatures: Partial<Features>,
): Promise<InternalTakomoProjectConfig> => {
  const contents = await readFileContents(path)
  const parsedFile = (await parseYaml(path, contents)) ?? {}

  const { error } = takomoProjectConfigFileSchema.validate(parsedFile, {
    abortEarly: false,
  })
  if (error) {
    const details = error.details.map((d) => `  - ${d.message}`).join("\n")
    throw new TakomoError(
      `${error.details.length} validation error(s) in project config file ${path}:\n\n${details}`,
    )
  }

  const requiredVersion = parsedFile.requiredVersion
  validateRequiredVersion(path, requiredVersion)

  const regions = parsedFile.regions ?? DEFAULT_REGIONS
  const resolvers = parseExternalResolvers(parsedFile.resolvers)
  const helpers = parseExternalHandlebarsHelpers(parsedFile.helpers)
  const features = {
    ...parseFeatures(parsedFile.features),
    ...overrideFeatures,
  }
  const varFiles = parseStringArray(parsedFile.varFiles)

  return {
    regions,
    requiredVersion,
    resolvers,
    helpers,
    features,
    varFiles,
    organization: parsedFile.organization,
    deploymentTargets: parsedFile.deploymentTargets,
  }
}

const { variableName } = createCommonSchema()

const accountRepositoryType = Joi.string()
  .min(1)
  .max(40)
  .regex(/^[a-zA-Z0-9-_]+$/)

const accountRepository = Joi.object({
  type: accountRepositoryType.required(),
}).unknown(true)

const deploymentTargetRepositoryType = Joi.string()
  .min(1)
  .max(40)
  .regex(/^[a-zA-Z0-9-_]+$/)

const deploymentTargetRepository = Joi.object({
  type: deploymentTargetRepositoryType.required(),
}).unknown(true)

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

export const takomoProjectConfigFileSchema = Joi.object({
  requiredVersion: Joi.string(),
  organization: Joi.object({
    repository: accountRepository,
  }),
  deploymentTargets: Joi.object({
    repository: deploymentTargetRepository,
  }),
  regions: Joi.array().items(Joi.string()).unique(),
  resolvers: Joi.array().items(Joi.string(), externalResolver),
  helpers: Joi.array().items(Joi.string(), externalHandlebarsHelper),
  varFiles,
  features,
})

export const loadProjectConfig = async (
  pathConfigFile: FilePath,
  overrideFeatures: Partial<Features>,
): Promise<InternalTakomoProjectConfig> => {
  if (!(await fileExists(pathConfigFile))) {
    return {
      regions: DEFAULT_REGIONS.slice(),
      resolvers: [],
      helpers: [],
      varFiles: [],
      features: { ...defaultFeatures(), ...overrideFeatures },
    }
  }

  return parseProjectConfigFile(pathConfigFile, overrideFeatures)
}
