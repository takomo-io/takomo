import {
  createCommonSchema,
  ExternalResolverConfig,
  InternalTakomoProjectConfig,
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

export const parseProjectConfigFile = async (
  path: FilePath,
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

  return {
    regions,
    requiredVersion,
    resolvers,
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
})

export const loadProjectConfig = async (
  pathConfigFile: FilePath,
): Promise<InternalTakomoProjectConfig> => {
  if (!(await fileExists(pathConfigFile))) {
    return {
      regions: DEFAULT_REGIONS.slice(),
      resolvers: [],
    }
  }

  return parseProjectConfigFile(pathConfigFile)
}
