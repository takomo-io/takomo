import { Options, parseCommandRole } from "@takomo/core"
import { StackConfigFile, StackGroupConfigFile } from "@takomo/stacks-model"
import {
  Logger,
  parseYaml,
  readFileContents,
  renderTemplate,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import { stackConfigFileSchema, stackGroupConfigFileSchema } from "../schema"
import {
  parseAccountIds,
  parseCapabilities,
  parseDepends,
  parseIgnore,
  parseRegions,
  parseSecrets,
  parseTags,
  parseTemplateBucket,
  parseTerminationProtection,
  parseTimeout,
} from "./internal"

export const parseStackConfigFile = async (
  logger: Logger,
  options: Options,
  variables: any,
  path: string,
  templateEngine: TemplateEngine,
): Promise<StackConfigFile> => {
  const logConfidentialInfo = options.isConfidentialInfoLoggingEnabled()
  const contents = await readFileContents(path)
  logger.traceText(`Raw stack config file:`, contents)

  const filterFn = logConfidentialInfo
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
    path,
    contents,
    variables,
  )

  logger.traceText(`Final rendered stack config file:`, rendered)

  const parsedFile = (await parseYaml(path, rendered)) || {}

  const { error } = stackConfigFileSchema.validate(parsedFile, {
    abortEarly: false,
  })

  if (error) {
    const details = error.details.map((d) => `  - ${d.message}`).join("\n")
    throw new TakomoError(
      `${error.details.length} validation error(s) in stack config file ${path}:\n\n${details}`,
    )
  }

  const parameters = parsedFile.parameters
    ? new Map(Object.entries(parsedFile.parameters))
    : new Map()

  const data = parsedFile.data || {}
  const capabilities = parseCapabilities(parsedFile.capabilities)
  const accountIds = parseAccountIds(parsedFile.accountIds)
  const ignore = parseIgnore(parsedFile.ignore)
  const terminationProtection = parseTerminationProtection(
    parsedFile.terminationProtection,
  )

  return {
    project: parsedFile.project || null,
    commandRole: parseCommandRole(parsedFile.commandRole),
    regions: parseRegions(parsedFile.regions),
    name: parsedFile.name || null,
    template: parsedFile.template || null,
    timeout: parseTimeout(parsedFile.timeout),
    depends: parseDepends(parsedFile.depends),
    templateBucket: parseTemplateBucket(parsedFile.templateBucket),
    tags: parseTags(parsedFile.tags),
    secrets: parseSecrets(parsedFile.secrets),
    hooks: parsedFile.hooks || [],
    ignore,
    terminationProtection,
    accountIds,
    capabilities,
    parameters,
    data,
  }
}

export const parseStackGroupConfigFile = async (
  logger: Logger,
  options: Options,
  variables: any,
  path: string,
  templateEngine: TemplateEngine,
): Promise<StackGroupConfigFile> => {
  const logConfidentialInfo = options.isConfidentialInfoLoggingEnabled()
  const contents = await readFileContents(path)

  const filterFn = logConfidentialInfo
    ? (obj: any) => obj
    : (obj: any) => {
        return {
          ...obj,
          env: "<concealed>",
        }
      }

  logger.traceText(`Raw stack group config file:`, contents)
  logger.traceObject(
    `Render stack group config file using variables:`,
    variables,
    filterFn,
  )

  const rendered = await renderTemplate(
    templateEngine,
    path,
    contents,
    variables,
  )
  logger.traceText(`Final rendered stack group config file:`, rendered)

  const parsedFile = (await parseYaml(path, rendered)) || {}

  const { error } = stackGroupConfigFileSchema.validate(parsedFile, {
    abortEarly: false,
  })
  if (error) {
    const details = error.details.map((d) => `  - ${d.message}`).join("\n")
    throw new TakomoError(
      `${error.details.length} validation error(s) in stack group config file ${path}:\n\n${details}`,
    )
  }

  const data = parsedFile.data || {}
  const capabilities = parseCapabilities(parsedFile.capabilities)
  const accountIds = parseAccountIds(parsedFile.accountIds)
  const ignore = parseIgnore(parsedFile.ignore)
  const terminationProtection = parseTerminationProtection(
    parsedFile.terminationProtection,
  )

  return {
    project: parsedFile.project || null,
    commandRole: parseCommandRole(parsedFile.commandRole),
    regions: parseRegions(parsedFile.regions),
    templateBucket: parseTemplateBucket(parsedFile.templateBucket),
    tags: parseTags(parsedFile.tags),
    timeout: parseTimeout(parsedFile.timeout),
    hooks: parsedFile.hooks || [],
    terminationProtection,
    ignore,
    accountIds,
    capabilities,
    data,
  }
}
