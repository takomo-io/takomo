import { CustomStackConfig } from "../../config/custom-stack-config.js"
import { StackGroupConfig } from "../../config/stack-group-config.js"
import { StandardStackConfig } from "../../config/standard-stack-config.js"
import { CommandContext } from "../../context/command-context.js"
import { buildStandardStackConfig } from "../../parser/stacks/build-standard-stack-config.js"
import { buildStackGroupConfig } from "../../parser/stacks/build-stack-group-config.js"
import { TemplateEngine } from "../../templating/template-engine.js"
import { TakomoError } from "../../utils/errors.js"
import { FilePath } from "../../utils/files.js"
import { TkmLogger } from "../../utils/logging.js"
import { parseYaml } from "../../utils/yaml.js"

export const parseBlueprintConfigFile = async (
  ctx: CommandContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: any,
  templateEngine: TemplateEngine,
  logger: TkmLogger,
  pathToFile: FilePath,
): Promise<StandardStackConfig> =>
  parseStandardStackConfigFileInternal(
    ctx,
    variables,
    templateEngine,
    logger,
    pathToFile,
    "blueprint",
  )

export const parseStackConfigFile = async (
  ctx: CommandContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: any,
  templateEngine: TemplateEngine,
  logger: TkmLogger,
  pathToFile: FilePath,
): Promise<StandardStackConfig | CustomStackConfig> => {
  const rendered = await templateEngine.renderTemplateFile({
    pathToFile,
    variables,
  })

  const parsedFile = parseYaml(pathToFile, rendered)
  if (typeof parsedFile === "number" || typeof parsedFile === "string") {
    throw new Error("Invalid yaml document")
  }

  if (typeof parsedFile.customType === "string") {
  }

  return parseStandardStackConfigFileInternal(
    ctx,
    variables,
    templateEngine,
    logger,
    pathToFile,
    "stack",
  )
}

const parseStandardStackConfigFileInternal = async (
  ctx: CommandContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: any,
  templateEngine: TemplateEngine,
  logger: TkmLogger,
  pathToFile: FilePath,
  configType: "blueprint" | "stack",
): Promise<StandardStackConfig> => {
  const rendered = await templateEngine.renderTemplateFile({
    pathToFile,
    variables,
  })

  const parsedFile = parseYaml(pathToFile, rendered)
  const result = buildStandardStackConfig(ctx, parsedFile, configType)
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: any,
  templateEngine: TemplateEngine,
  logger: TkmLogger,
  pathToFile: FilePath,
): Promise<StackGroupConfig> => {
  const rendered = await templateEngine.renderTemplateFile({
    pathToFile,
    variables,
  })

  const parsedFile = parseYaml(pathToFile, rendered)
  const result = buildStackGroupConfig(ctx, parsedFile)

  if (result.isOk()) {
    return result.value
  }

  const details = result.error.messages.map((m: unknown) => `- ${m}`).join("\n")
  throw new TakomoError(
    `Validation errors in stack group configuration file ${pathToFile}:\n${details}`,
  )
}
