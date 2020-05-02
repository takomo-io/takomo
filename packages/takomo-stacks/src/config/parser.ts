import {
  AccountId,
  Options,
  parseCommandRole,
  Region,
  StackPath,
} from "@takomo/core"
import {
  Logger,
  parseYaml,
  readFileContents,
  renderTemplate,
  TakomoError,
  TemplateEngine,
} from "@takomo/util"
import { Capability } from "aws-sdk/clients/cloudformation"
import {
  SecretConfig,
  StackConfigFile,
  StackGroupConfigFile,
  TemplateBucketConfig,
  TimeoutConfig,
} from "../model"
import { stackConfigFileSchema, stackGroupConfigFileSchema } from "./schema"

const parseTemplateBucket = (value: any): TemplateBucketConfig | null => {
  if (!value) {
    return null
  }

  const { name, keyPrefix } = value

  return {
    name: name || null,
    keyPrefix: keyPrefix || null,
  }
}

const parseTimeout = (value: any): TimeoutConfig | null => {
  if (!value) {
    return null
  }

  if (typeof value === "number") {
    return {
      create: value,
      update: value,
    }
  }

  return {
    create: value.create,
    update: value.update,
  }
}

const parseTags = (value: any): Map<string, string> => {
  if (value === null || value === undefined) {
    return new Map()
  }

  return new Map(
    Object.entries(value).map((e) => {
      const [k, v] = e
      return [k, `${v}`]
    }),
  )
}

const parseSecrets = (value: any): Map<string, SecretConfig> => {
  if (value === null || value === undefined) {
    return new Map()
  }

  return new Map(
    Object.keys(value).map((name) => {
      const v = value[name]
      const description = v.description
      const secret = {
        name,
        description,
      }

      return [name, secret]
    }),
  )
}

const parseDepends = (value: any): StackPath[] => {
  if (value === null || value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

const parseRegions = (value: any): Region[] => {
  if (value === null || value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

const parseCapabilities = (value: any): Capability[] | null => {
  if (value === null || value === undefined) {
    return null
  }

  return Array.isArray(value) ? value : [value]
}

const parseAccountIds = (value: any): AccountId[] | null => {
  if (value === null || value === undefined) {
    return null
  }

  return Array.isArray(value)
    ? value.map((a) => a.toString())
    : [value.toString()]
}

const parseIgnore = (value: any): boolean | null => {
  if (value === null || value === undefined) {
    return null
  }

  return value === true
}

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

  const parsedFile = (await parseYaml(rendered)) || {}

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

  const parsedFile = (await parseYaml(rendered)) || {}

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

  return {
    project: parsedFile.project || null,
    commandRole: parseCommandRole(parsedFile.commandRole),
    regions: parseRegions(parsedFile.regions),
    templateBucket: parseTemplateBucket(parsedFile.templateBucket),
    tags: parseTags(parsedFile.tags),
    timeout: parseTimeout(parsedFile.timeout),
    hooks: parsedFile.hooks || [],
    ignore,
    accountIds,
    capabilities,
    data,
  }
}
