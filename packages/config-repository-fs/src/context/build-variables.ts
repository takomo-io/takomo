import { ContextVars, Variables } from "@takomo/core"
import {
  expandFilePath,
  fileExists,
  FilePath,
  loadVariablesFromFiles,
  readFileContents,
  TakomoError,
  VarFileOption,
} from "@takomo/util"
import dotenv from "dotenv"
import dotenvExpand from "dotenv-expand"

const overrideEnvironmentVariablesFromEnvironmentVariablesFiles = async (
  projectDir: FilePath,
  envFileArgs: any,
): Promise<void> => {
  const envArray = envFileArgs
    ? Array.isArray(envFileArgs)
      ? envFileArgs
      : [envFileArgs]
    : []

  for (const envArg of envArray) {
    const pathToEnvVarsFile = expandFilePath(projectDir, envArg)

    if (!(await fileExists(pathToEnvVarsFile))) {
      throw new TakomoError(
        `Environment variables file ${pathToEnvVarsFile} not found`,
      )
    }

    const contents = await readFileContents(pathToEnvVarsFile)
    const envConfig = dotenv.parse(contents)
    dotenvExpand(envConfig)

    for (const k in envConfig) {
      process.env[k] = envConfig[k]
    }
  }
}

const loadEnvironmentVariables = (): any =>
  Object.keys(process.env).reduce((collected, key) => {
    return { ...collected, [key]: process.env[key] }
  }, {})

const loadContextVariables = (projectDir: FilePath): ContextVars => ({
  projectDir,
})

export const buildVariables = async (
  projectDir: FilePath,
  varFileArgs: ReadonlyArray<VarFileOption>,
  vars: Record<string, unknown>,
  envFileArgs: ReadonlyArray<FilePath>,
): Promise<Variables> => {
  const mergedVars = await loadVariablesFromFiles(projectDir, vars, varFileArgs)

  await overrideEnvironmentVariablesFromEnvironmentVariablesFiles(
    projectDir,
    envFileArgs,
  )

  const env = loadEnvironmentVariables()
  const context = loadContextVariables(projectDir)
  return {
    env,
    var: mergedVars,
    context,
  }
}
