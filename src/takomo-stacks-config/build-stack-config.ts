import { err, ok, Result } from "neverthrow"
import { createStackConfigSchema } from "../schema/stack-config-schema"
import {
  CommandContext,
  parseCommandRole,
  parseOptionalBoolean,
  parseOptionalString,
  parseOptionalStringArray,
  parseStringArray,
} from "../takomo-core"
import { ValidationError } from "../utils/errors"
import { StackConfig } from "./model"
import { parseAccountIds } from "./parse-account-ids"
import { parseData } from "./parse-data"
import { parseHooks } from "./parse-hooks"
import { parseParameters } from "./parse-parameters"
import { parseSchemas } from "./parse-schemas"
import { parseStackPolicy } from "./parse-stack-policy"
import { parseTags } from "./parse-tags"
import { parseTemplate } from "./parse-template"
import { parseTemplateBucket } from "./parse-template-bucket"
import { parseTimeout } from "./parse-timeout"

export const buildStackConfig = (
  ctx: CommandContext,
  record: Record<string, unknown>,
  configType: "stack" | "blueprint",
): Result<StackConfig, ValidationError> => {
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
