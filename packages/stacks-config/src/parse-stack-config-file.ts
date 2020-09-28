import { Options, parseCommandRole } from "@takomo/core"
import { StackConfigFile } from "@takomo/stacks-model"
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
import { parseDepends } from "./parse-depends"
import { parseIgnore } from "./parse-ignore"
import { parseRegions } from "./parse-regions"
import { parseSecrets } from "./parse-secrets"
import { parseTags } from "./parse-tags"
import { parseTemplateBucket } from "./parse-template-bucket"
import { parseTerminationProtection } from "./parse-termination-protection"
import { parseTimeout } from "./parse-timeout"
import { stackConfigFileSchema } from "./schema"

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
