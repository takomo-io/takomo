import {
  CommandContext,
  parseBoolean,
  parseCommandRole,
  parseOptionalBoolean,
  parseOptionalString,
  parseOptionalStringArray,
  parseStringArray,
} from "@takomo/core"
import { ValidationError } from "@takomo/util"
import { err, ok, Result } from "neverthrow"
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
import { createStackConfigSchema } from "./schema"

export const buildStackConfig = (
  ctx: CommandContext,
  record: Record<string, unknown>,
): Result<StackConfig, ValidationError> => {
  const { error } = createStackConfigSchema({
    regions: ctx.regions,
  }).validate(record, {
    abortEarly: false,
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
    terminationProtection: parseOptionalBoolean(record.terminationProtection),
    capabilities: parseOptionalStringArray(record.capabilities),
    project: parseOptionalString(record.project),
    commandRole: parseCommandRole(record.commandRole),
    regions: parseStringArray(record.regions),
    name: parseOptionalString(record.name),
    timeout: parseTimeout(record.timeout),
    depends: parseStringArray(record.depends),
    templateBucket: parseTemplateBucket(record.templateBucket),
    tags: parseTags(record.tags),
    inheritTags: parseBoolean(record.inheritTags, true),
    parameters: parseParameters(record.parameters),
  })
}
