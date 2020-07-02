import { parseYaml, readFileContents, TakomoError } from "@takomo/util"
import semver from "semver"
import { TakomoProjectConfig } from "./model"
import { takomoProjectConfigFileSchema } from "./schema"

// eslint-disable-next-line
const packageJson = require("../../package.json")
const version = packageJson.version

const validateRequiredVersion = (
  configFilePath: string,
  requiredVersion: string | null,
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

export const parseProjectConfigFile = async (
  path: string,
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

  const requiredVersion = parsedFile.requiredVersion || null
  validateRequiredVersion(path, requiredVersion)

  return {
    requiredVersion,
  }
}
