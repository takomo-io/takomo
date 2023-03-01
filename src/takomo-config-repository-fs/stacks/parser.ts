import { StackConfig } from "../../config/stack-config.js"
import { StackGroupConfig } from "../../config/stack-group-config.js"
import { CommandContext } from "../../context/command-context.js"
import { buildStackConfig } from "../../parser/stacks/build-stack-config.js"
import { buildStackGroupConfig } from "../../parser/stacks/build-stack-group-config.js"
import { TemplateEngine } from "../../templating/template-engine.js"
import { TakomoError } from "../../utils/errors.js"
import { FilePath } from "../../utils/files.js"
import { TkmLogger } from "../../utils/logging.js"
import { parseYaml } from "../../utils/yaml.js"

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
  const rendered = await templateEngine.renderTemplateFile({
    pathToFile,
    variables,
  })

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
  const rendered = await templateEngine.renderTemplateFile({
    pathToFile,
    variables,
  })

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
