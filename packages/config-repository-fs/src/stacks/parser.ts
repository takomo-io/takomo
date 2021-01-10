import { CommandContext } from "@takomo/core"
import {
  buildStackConfig,
  buildStackGroupConfig,
  StackConfig,
  StackGroupConfig,
} from "@takomo/stacks-config"
import {
  FilePath,
  parseYaml,
  readFileContents,
  renderTemplate,
  TakomoError,
  TemplateEngine,
  TkmLogger,
} from "@takomo/util"

export const parseStackConfigFile = async (
  ctx: CommandContext,
  variables: any,
  templateEngine: TemplateEngine,
  logger: TkmLogger,
  pathToFile: FilePath,
): Promise<StackConfig> => {
  const contents = await readFileContents(pathToFile)
  logger.traceText(`Raw stack config contents:`, contents)

  const filterFn = ctx.confidentialValuesLoggingEnabled
    ? (obj: any) => obj
    : (obj: any) => {
        return {
          ...obj,
          env: "<concealed>",
        }
      }

  logger.traceObject(
    `Render stack config file using variables:`,
    variables,
    filterFn,
  )

  const rendered = await renderTemplate(
    templateEngine,
    pathToFile,
    contents,
    variables,
  )

  logger.traceText(`Final rendered stack config contents:`, rendered)

  const parsedFile = (await parseYaml(pathToFile, rendered)) || {}
  const result = await buildStackConfig(ctx, parsedFile)
  if (result.isOk()) {
    return result.value
  }

  const details = result.error.messages.map((m) => `- ${m}`).join("\n")
  throw new TakomoError(
    `Validation errors in stack configuration file ${pathToFile}:\n${details}`,
  )
}

export const parseStackGroupConfigFile = async (
  ctx: CommandContext,
  variables: any,
  templateEngine: TemplateEngine,
  logger: TkmLogger,
  pathToFile: FilePath,
): Promise<StackGroupConfig> => {
  const contents = await readFileContents(pathToFile)
  logger.traceText(`Raw stack group config contents:`, contents)

  const filterFn = ctx.confidentialValuesLoggingEnabled
    ? (obj: any) => obj
    : (obj: any) => {
        return {
          ...obj,
          env: "<concealed>",
        }
      }

  logger.traceObject(
    `Render stack group config file using variables:`,
    () => variables,
    filterFn,
  )

  const rendered = await renderTemplate(
    templateEngine,
    pathToFile,
    contents,
    variables,
  )

  logger.traceText(`Final rendered stack config contents:`, () => rendered)

  const parsedFile = (await parseYaml(pathToFile, rendered)) || {}
  const result = buildStackGroupConfig(ctx, parsedFile)

  if (result.isOk()) {
    return result.value
  }

  const details = result.error.messages.map((m) => `- ${m}`).join("\n")
  throw new TakomoError(
    `Validation errors in stack group configuration file ${pathToFile}:\n${details}`,
  )
}
