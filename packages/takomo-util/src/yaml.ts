import yaml from "js-yaml"
import { TakomoError } from "./errors"
import { buildErrorMessage } from "./errors/build-error-message"
import { readFileContents } from "./files"

export const parseYaml = (filePath: string, contents: string): any => {
  try {
    return yaml.safeLoad(contents)
  } catch (e) {
    if (e.name === "YAMLException") {
      console.log(JSON.stringify(e, null, 2))
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

export const parseYamlFile = async (pathToYamlFile: string): Promise<any> =>
  readFileContents(pathToYamlFile).then((c) => parseYaml(pathToYamlFile, c))

export const formatYaml = (object: any): string =>
  yaml.safeDump(object, { skipInvalid: true, lineWidth: 300, noRefs: true })
