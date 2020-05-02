import yaml from "js-yaml"
import { readFileContents } from "./files"

export const parseYaml = (yamlString: string): any => yaml.safeLoad(yamlString)

export const parseYamlFile = async (pathToYamlFile: string): Promise<any> =>
  readFileContents(pathToYamlFile).then(parseYaml)

export const formatYaml = (object: any): string =>
  yaml.safeDump(object, { skipInvalid: true, lineWidth: 300, noRefs: true })
