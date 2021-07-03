import {
  CommandContext,
  parseCommandRole,
  parseOptionalBoolean,
  parseOptionalString,
  parseOptionalStringArray,
  parseStringArray,
} from "@takomo/core"
import { ValidationError } from "@takomo/util"
import { err, ok, Result } from "neverthrow"
import { StackGroupConfig } from "./model"
import { parseAccountIds } from "./parse-account-ids"
import { parseData } from "./parse-data"
import { parseHooks } from "./parse-hooks"
import { parseSchemas } from "./parse-schemas"
import { parseStackPolicy } from "./parse-stack-policy"
import { parseTags } from "./parse-tags"
import { parseTemplateBucket } from "./parse-template-bucket"
import { parseTimeout } from "./parse-timeout"
import { createStackGroupConfigSchema } from "./schema"

export const buildStackGroupConfig = (
  ctx: CommandContext,
  record: Record<string, unknown>,
): Result<StackGroupConfig, ValidationError> => {
  const { error } = createStackGroupConfigSchema({
    regions: ctx.regions,
  }).validate(record, {
    abortEarly: false,
  })

  if (error) {
    const details = error.details.map((d) => d.message)
    return err(
      new ValidationError(
        "Validation errors in stack group configuration",
        details,
      ),
    )
  }

  const schemas = parseSchemas(record.schemas)
  const data = parseData(record.data)
  const hooks = parseHooks(record.hooks)
  const accountIds = parseAccountIds(record.accountIds)
  const stackPolicy = parseStackPolicy(record.stackPolicy)
  const stackPolicyDuringUpdate = parseStackPolicy(
    record.stackPolicyDuringUpdate,
  )

  return ok({
    hooks,
    data,
    stackPolicy,
    stackPolicyDuringUpdate,
    schemas,
    accountIds,
    terminationProtection: parseOptionalBoolean(record.terminationProtection),
    ignore: parseOptionalBoolean(record.ignore),
    capabilities: parseOptionalStringArray(record.capabilities),
    project: parseOptionalString(record.project),
    commandRole: parseCommandRole(record.commandRole),
    regions: parseStringArray(record.regions),
    templateBucket: parseTemplateBucket(record.templateBucket),
    tags: parseTags(record.tags),
    timeout: parseTimeout(record.timeout),
  })
}
