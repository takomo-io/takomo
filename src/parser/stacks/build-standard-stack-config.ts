import { err, ok, Result } from "neverthrow"
import { CommandContext } from "../../context/command-context.js"
import { createStackConfigSchema } from "../../schema/stack-config-schema.js"
import { ValidationError } from "../../utils/errors.js"
import {
  parseCommandRole,
  parseOptionalBoolean,
  parseOptionalString,
  parseOptionalStringArray,
  parseStringArray,
} from "../common-parser.js"
import { parseAccountIds } from "./parse-account-ids.js"
import { parseData } from "./parse-data.js"
import { parseHooks } from "./parse-hooks.js"
import { parseParameters } from "./parse-parameters.js"
import { parseSchemas } from "./parse-schemas.js"
import { parseStackPolicy } from "./parse-stack-policy.js"
import { parseTags } from "./parse-tags.js"
import { parseTemplateBucket } from "./parse-template-bucket.js"
import { parseTemplate } from "./parse-template.js"
import { parseTimeout } from "./parse-timeout.js"
import { ParsedYamlDocument } from "../../utils/yaml.js"
import { StandardStackConfig } from "../../config/standard-stack-config.js"

export const buildStandardStackConfig = (
  ctx: CommandContext,
  record: ParsedYamlDocument,
  configType: "stack" | "blueprint",
): Result<StandardStackConfig, ValidationError> => {
  const { error } = createStackConfigSchema({
    regions: ctx.regions,
    configType,
  }).validate(record, {
    abortEarly: false,
    convert: false,
  })

  if (error) {
    const details = error.details.map((d) => d.message)
    return err(
      new ValidationError("Validation errors in stack configuration", details),
    )
  }

  if (typeof record === "number" || typeof record === "string") {
    throw new Error("Invalid yaml document")
  }

  const schemas = parseSchemas(record.schemas)
  const data = parseData(record.data)
  const hooks = parseHooks(record.hooks)
  const accountIds = parseAccountIds(record.accountIds)
  const template = parseTemplate(record.template)
  const stackPolicy = parseStackPolicy(record.stackPolicy)
  const stackPolicyDuringUpdate = parseStackPolicy(
    record.stackPolicyDuringUpdate,
  )

  return ok({
    accountIds,
    data,
    hooks,
    template,
    stackPolicy,
    stackPolicyDuringUpdate,
    schemas,
    ignore: parseOptionalBoolean(record.ignore),
    obsolete: parseOptionalBoolean(record.obsolete),
    terminationProtection: parseOptionalBoolean(record.terminationProtection),
    capabilities: parseOptionalStringArray(record.capabilities),
    project: parseOptionalString(record.project),
    commandRole: parseCommandRole(record.commandRole),
    regions: parseStringArray(record.regions),
    name: parseOptionalString(record.name),
    timeout: parseTimeout(record.timeout),
    depends: parseOptionalStringArray(record.depends),
    templateBucket: parseTemplateBucket(record.templateBucket),
    tags: parseTags(record.tags),
    inheritTags: parseOptionalBoolean(record.inheritTags),
    parameters: parseParameters(record.parameters),
    blueprint: parseOptionalString(record.blueprint),
  })
}
