import { Options, parseCommandRole } from "@takomo/core"
import { StackGroupConfigFile } from "@takomo/stacks-model"
import {
  Logger,
  parseYaml,
  readFileContents,
  renderTemplate,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import { parseAccountIds } from "./parse-account-ids"
import { parseCapabilities } from "./parse-capabilities"
import { parseIgnore } from "./parse-ignore"
import { parseRegions } from "./parse-regions"
import { parseTags } from "./parse-tags"
import { parseTemplateBucket } from "./parse-template-bucket"
import { parseTerminationProtection } from "./parse-termination-protection"
import { parseTimeout } from "./parse-timeout"
import { stackGroupConfigFileSchema } from "./schema"

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
