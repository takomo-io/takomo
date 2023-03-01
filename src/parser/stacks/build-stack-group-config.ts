import { err, ok, Result } from "neverthrow"
import { StackGroupConfig } from "../../config/stack-group-config.js"
import { CommandContext } from "../../context/command-context.js"
import { createStackGroupConfigSchema } from "../../schema/stack-group-config-schema.js"
import { StackPropertyDefaults } from "../../takomo-stacks-model/constants.js"
import { ValidationError } from "../../utils/errors.js"
import {
  parseBoolean,
  parseCommandRole,
  parseOptionalBoolean,
  parseOptionalString,
  parseOptionalStringArray,
  parseStringArray,
} from "../common-parser.js"
import { parseAccountIds } from "./parse-account-ids.js"
import { parseData } from "./parse-data.js"
import { parseHooks } from "./parse-hooks.js"
import { parseSchemas } from "./parse-schemas.js"
import { parseStackPolicy } from "./parse-stack-policy.js"
import { parseTags } from "./parse-tags.js"
import { parseTemplateBucket } from "./parse-template-bucket.js"
import { parseTimeout } from "./parse-timeout.js"

export const buildStackGroupConfig = (
  ctx: CommandContext,
  record: Record<string, unknown>,
): Result<StackGroupConfig, ValidationError> => {
  const { error } = createStackGroupConfigSchema({
    regions: ctx.regions,
  }).validate(record, {
    abortEarly: false,
    convert: false,
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
    obsolete: parseOptionalBoolean(record.obsolete),
    capabilities: parseOptionalStringArray(record.capabilities),
    project: parseOptionalString(record.project),
    commandRole: parseCommandRole(record.commandRole),
    regions: parseStringArray(record.regions),
    templateBucket: parseTemplateBucket(record.templateBucket),
    tags: parseTags(record.tags),
    inheritTags: parseBoolean(
      record.inheritTags,
      StackPropertyDefaults.inheritTags(),
    ),
    timeout: parseTimeout(record.timeout),
  })
}
