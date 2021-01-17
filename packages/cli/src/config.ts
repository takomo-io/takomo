import {
  fileExists,
  FilePath,
  parseYaml,
  readFileContents,
  TakomoError,
} from "@takomo/util"
import Joi from "joi"
import semver from "semver"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require("../package.json")

export interface TakomoProjectConfig {
  readonly requiredVersion?: string
}

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

const parseProjectConfigFile = async (
  path: FilePath,
): Promise<TakomoProjectConfig> => {
  const contents = await readFileContents(path)
  const parsedFile = (await parseYaml(path, contents)) || {}

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

  return {
    requiredVersion,
  }
}

export const takomoProjectConfigFileSchema = Joi.object({
  requiredVersion: Joi.string(),
})

export const loadProjectConfig = async (
  pathConfigFile: FilePath,
): Promise<void> => {
  if (!(await fileExists(pathConfigFile))) {
    return
  }

  await parseProjectConfigFile(pathConfigFile)
}
