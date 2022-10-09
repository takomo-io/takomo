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
  baseDir: FilePath,
  fileName: FilePath,
): Promise<any> => {
  const pathToVarsFile = expandFilePath(baseDir, fileName)

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
  varsArray: ReadonlyArray<VarFileOption>,
): Promise<Record<string, unknown>> => {
  let vars = {}
  for (const { filePath, variableName } of varsArray) {
    const varsFromFile = await loadVariablesFromFile(projectDir, filePath)
    if (variableName) {
      vars = merge(vars, { [variableName]: varsFromFile })
    } else {
      const varsFromFile = await loadVariablesFromFile(projectDir, filePath)
      if (typeof varsFromFile !== "object") {
        throw new TakomoError(
          `Contents of variable file ${filePath} could not be deserialized to an object`,
        )
      }

      vars = merge(vars, varsFromFile)
    }
  }

  return vars
}
