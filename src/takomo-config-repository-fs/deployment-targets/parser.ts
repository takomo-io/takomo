import { CommandContext } from "../../context/command-context.js"
import { TemplateEngine } from "../../templating/template-engine.js"
import { FilePath } from "../../utils/files.js"
import { TkmLogger } from "../../utils/logging.js"
import { ParsedYamlDocument, parseYaml } from "../../utils/yaml.js"

export const parseConfigFile = async (
  ctx: CommandContext,
  logger: TkmLogger,
  templateEngine: TemplateEngine,
  pathToFile: FilePath,
): Promise<ParsedYamlDocument> => {
  const { variables } = ctx

  const rendered = await templateEngine.renderTemplateFile({
    pathToFile,
    variables,
  })

  return parseYaml(pathToFile, rendered)
}
