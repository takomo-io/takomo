import yaml from "js-yaml"
import stringify from "json-stable-stringify"
import { TakomoError } from "./errors.js"
import { FilePath, readFileContents } from "./files.js"
import { buildErrorMessage } from "./templating.js"

export type YamlFormattedString = string

export const parseYamlString = (contents: YamlFormattedString): unknown =>
  yaml.load(contents)

export const parseYaml = (
  filePath: FilePath,
  contents: YamlFormattedString,
): any => {
  try {
    return yaml.load(contents)
  } catch (e: any) {
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

export const parseYamlFile = async (pathToYamlFile: FilePath): Promise<any> =>
  readFileContents(pathToYamlFile).then((c) => parseYaml(pathToYamlFile, c))

export const formatYaml = (object: unknown): YamlFormattedString =>
  yaml.dump(JSON.parse(stringify(object)), {
    skipInvalid: true,
    lineWidth: 300,
    noRefs: true,
    sortKeys: true,
  })
