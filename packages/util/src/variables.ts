import { TakomoError } from "./errors"
import { expandFilePath, fileExists, FilePath, readFileContents } from "./files"
import { merge } from "./objects"
import { parseYamlFile } from "./yaml"

/**
 * @hidden
 */
export interface VarFileOption {
  readonly filePath: FilePath
  readonly variableName?: string
}

/**
 * @hidden
 */
export const loadVariablesFromFile = async (
  projectDir: FilePath,
  fileName: FilePath,
): Promise<any> => {
  const pathToVarsFile = expandFilePath(projectDir, fileName)

  if (!(await fileExists(pathToVarsFile))) {
    throw new TakomoError(`Variable file ${pathToVarsFile} not found`)
  }

  if (pathToVarsFile.endsWith(".json")) {
    const contents = await readFileContents(pathToVarsFile)
    return JSON.parse(contents)
  }

  if (pathToVarsFile.endsWith(".yml")) {
    return parseYamlFile(pathToVarsFile)
  }

  return (await readFileContents(pathToVarsFile)).trim()
}

/**
 * @hidden
 */
export const loadVariablesFromFiles = async (
  projectDir: FilePath,
  vars: Record<string, unknown>,
  varsArray: ReadonlyArray<VarFileOption>,
): Promise<Record<string, unknown>> => {
  let fileVars = {}
  for (const { filePath, variableName } of varsArray) {
    const varsFromFile = await loadVariablesFromFile(projectDir, filePath)
    if (variableName) {
      fileVars = merge(fileVars, { [variableName]: varsFromFile })
    } else {
      const varsFromFile = await loadVariablesFromFile(projectDir, filePath)
      if (typeof varsFromFile !== "object") {
        throw new TakomoError(
          `Contents of variable file ${filePath} could not be deserialized to an object`,
        )
      }

      fileVars = merge(fileVars, varsFromFile)
    }
  }

  return merge(fileVars, vars)
}
