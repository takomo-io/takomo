import yaml from "js-yaml"
import { TakomoError } from "./errors"
import { FilePath, readFileContents } from "./files"
import { buildErrorMessage } from "./templating"

/**
 * @hidden
 */
export type YamlFormattedString = string

/**
 * @hidden
 */
export const parseYamlString = (contents: YamlFormattedString): unknown =>
  yaml.load(contents)

/**
 * @hidden
 */
export const parseYaml = (
  filePath: FilePath,
  contents: YamlFormattedString,
): any => {
  try {
    return yaml.load(contents)
  } catch (e) {
    if (e.name === "YAMLException") {
      const errorMessage = buildErrorMessage(
        `An error occurred while parsing file: ${filePath}`,
        contents,
        {
          lineNumber: e.mark?.line + 1,
          endLineNumber: e.mark?.line + 1,
          column: e.mark?.column + 1,
          endColumn: e.mark?.column + 1,
          message: e.message,
        },
      )

      throw new TakomoError(errorMessage)
    }

    const errorMessage = buildErrorMessage(
      `An error occurred while parsing file: ${filePath}`,
      contents,
      e,
    )

    throw new TakomoError(errorMessage)
  }
}

/**
 * @hidden
 */
export const parseYamlFile = async (pathToYamlFile: FilePath): Promise<any> =>
  readFileContents(pathToYamlFile).then((c) => parseYaml(pathToYamlFile, c))

/**
 * @hidden
 */
export const formatYaml = (object: unknown): YamlFormattedString =>
  yaml.dump(object, {
    skipInvalid: true,
    lineWidth: 300,
    noRefs: true,
    sortKeys: true,
  })
