import { CommandContext, parseCommandRole } from "@takomo/core"
import { ValidationError } from "@takomo/util"
import { err, ok, Result } from "neverthrow"
import { StackGroupConfig } from "./model"
import { parseAccountIds } from "./parse-account-ids"
import { parseCapabilities } from "./parse-capabilities"
import { parseData } from "./parse-data"
import { parseHooks } from "./parse-hooks"
import { parseIgnore } from "./parse-ignore"
import { parseRegions } from "./parse-regions"
import { parseSchemas } from "./parse-schemas"
import { parseStackPolicy } from "./parse-stack-policy"
import { parseString } from "./parse-string"
import { parseTags } from "./parse-tags"
import { parseTemplateBucket } from "./parse-template-bucket"
import { parseTerminationProtection } from "./parse-termination-protection"
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
  const capabilities = parseCapabilities(record.capabilities)
  const accountIds = parseAccountIds(record.accountIds)
  const ignore = parseIgnore(record.ignore)
  const terminationProtection = parseTerminationProtection(
    record.terminationProtection,
  )
  const stackPolicy = parseStackPolicy(record.stackPolicy)
  const stackPolicyDuringUpdate = parseStackPolicy(
    record.stackPolicyDuringUpdate,
  )

  return ok({
    hooks,
    terminationProtection,
    ignore,
    accountIds,
    capabilities,
    data,
    stackPolicy,
    stackPolicyDuringUpdate,
    schemas,
    project: parseString(record.project),
    commandRole: parseCommandRole(record.commandRole),
    regions: parseRegions(record.regions),
    templateBucket: parseTemplateBucket(record.templateBucket),
    tags: parseTags(record.tags),
    timeout: parseTimeout(record.timeout),
  })
}
