import { CommandContext } from "@takomo/core"
import {
  FilePath,
  parseYaml,
  readFileContents,
  renderTemplate,
  TemplateEngine,
  TkmLogger,
} from "@takomo/util"

export const parseOrganizationConfigFile = async (
  ctx: CommandContext,
  templateEngine: TemplateEngine,
  logger: TkmLogger,
  pathToFile: FilePath,
): Promise<Record<string, any>> => {
  const logConfidentialInfo = ctx.confidentialValuesLoggingEnabled
  const variables = ctx.variables

  const filterFn = logConfidentialInfo
    ? (obj: any) => obj
    : (obj: any) => {
        return {
          ...obj,
          env: "*****",
        }
      }

  const contents = await readFileContents(pathToFile)

  logger.traceText("Raw organization config file:", contents)
  logger.traceObject(
    "Render organization config file using variables:",
    variables,
    filterFn,
  )

  const rendered = await renderTemplate(
    templateEngine,
    pathToFile,
    contents,
    variables,
  )

  logger.traceText(`Final rendered organization config file:`, rendered)

  return (await parseYaml(pathToFile, rendered)) ?? {}
}
