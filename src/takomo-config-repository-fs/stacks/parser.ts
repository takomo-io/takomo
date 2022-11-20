import { CommandContext } from "../../takomo-core"
import {
  buildStackConfig,
  buildStackGroupConfig,
  StackConfig,
  StackGroupConfig,
} from "../../takomo-stacks-config"
import { TakomoError } from "../../utils/errors"
import { FilePath, readFileContents } from "../../utils/files"
import { TkmLogger } from "../../utils/logging"
import { renderTemplate, TemplateEngine } from "../../utils/templating"
import { parseYaml } from "../../utils/yaml"

export const parseBlueprintConfigFile = async (
  ctx: CommandContext,
  variables: any,
  templateEngine: TemplateEngine,
  logger: TkmLogger,
  pathToFile: FilePath,
): Promise<StackConfig> =>
  parseStackConfigFileInternal(
    ctx,
    variables,
    templateEngine,
    logger,
    pathToFile,
    "blueprint",
  )

export const parseStackConfigFile = async (
  ctx: CommandContext,
  variables: any,
  templateEngine: TemplateEngine,
  logger: TkmLogger,
  pathToFile: FilePath,
): Promise<StackConfig> =>
  parseStackConfigFileInternal(
    ctx,
    variables,
    templateEngine,
    logger,
    pathToFile,
    "stack",
  )

const parseStackConfigFileInternal = async (
  ctx: CommandContext,
  variables: any,
  templateEngine: TemplateEngine,
  logger: TkmLogger,
  pathToFile: FilePath,
  configType: "blueprint" | "stack",
): Promise<StackConfig> => {
  const contents = await readFileContents(pathToFile)
  logger.traceText(`Raw ${configType} file ${pathToFile} contents:`, contents)

  const filterFn = ctx.confidentialValuesLoggingEnabled
    ? (obj: any) => obj
    : (obj: any) => {
        return {
          ...obj,
          env: "*****",
        }
      }

  logger.traceObject(
    `Render ${configType} file ${pathToFile} using variables:`,
    variables,
    filterFn,
  )

  const rendered = await renderTemplate(
    templateEngine,
    pathToFile,
    contents,
    variables,
  )

  logger.traceText(
    `Final rendered ${configType} file ${pathToFile} contents:`,
    rendered,
  )

  const parsedFile = (await parseYaml(pathToFile, rendered)) || {}
  const result = await buildStackConfig(ctx, parsedFile, configType)
  if (result.isOk()) {
    return result.value
  }

  const details = result.error.messages.map((m: unknown) => `- ${m}`).join("\n")
  throw new TakomoError(
    `Validation errors in ${configType} file ${pathToFile}:\n${details}`,
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
          env: "*****",
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

  const details = result.error.messages.map((m: unknown) => `- ${m}`).join("\n")
  throw new TakomoError(
    `Validation errors in stack group configuration file ${pathToFile}:\n${details}`,
  )
}
