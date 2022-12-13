import { CommandContext } from "../../context/command-context"
import { TemplateEngine } from "../../templating/template-engine"
import { FilePath } from "../../utils/files"
import { TkmLogger } from "../../utils/logging"
import { parseYaml } from "../../utils/yaml"

export const parseConfigFile = async (
  ctx: CommandContext,
  logger: TkmLogger,
  templateEngine: TemplateEngine,
  pathToFile: FilePath,
): Promise<Record<string, unknown>> => {
  const { variables } = ctx

  const rendered = await templateEngine.renderTemplateFile({
    pathToFile,
    variables,
  })

  return parseYaml(pathToFile, rendered) ?? {}
}
