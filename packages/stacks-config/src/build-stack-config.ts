import { CommandContext, parseCommandRole } from "@takomo/core"
import { ValidationError } from "@takomo/util"
import { err, ok, Result } from "neverthrow"
import { StackConfig } from "./model"
import { parseAccountIds } from "./parse-account-ids"
import { parseCapabilities } from "./parse-capabilities"
import { parseData } from "./parse-data"
import { parseDepends } from "./parse-depends"
import { parseHooks } from "./parse-hooks"
import { parseIgnore } from "./parse-ignore"
import { parseParameters } from "./parse-parameters"
import { parseRegions } from "./parse-regions"
import { parseSchemas } from "./parse-schemas"
import { parseStackPolicy } from "./parse-stack-policy"
import { parseString } from "./parse-string"
import { parseTags } from "./parse-tags"
import { parseTemplate } from "./parse-template"
import { parseTemplateBucket } from "./parse-template-bucket"
import { parseTerminationProtection } from "./parse-termination-protection"
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
  const capabilities = parseCapabilities(record.capabilities)
  const accountIds = parseAccountIds(record.accountIds)
  const ignore = parseIgnore(record.ignore)
  const template = parseTemplate(record.template)
  const stackPolicy = parseStackPolicy(record.stackPolicy)
  const stackPolicyDuringUpdate = parseStackPolicy(
    record.stackPolicyDuringUpdate,
  )
  const terminationProtection = parseTerminationProtection(
    record.terminationProtection,
  )

  return ok({
    ignore,
    terminationProtection,
    accountIds,
    capabilities,
    data,
    hooks,
    template,
    stackPolicy,
    stackPolicyDuringUpdate,
    schemas,
    project: parseString(record.project),
    commandRole: parseCommandRole(record.commandRole),
    regions: parseRegions(record.regions),
    name: parseString(record.name),
    timeout: parseTimeout(record.timeout),
    depends: parseDepends(record.depends),
    templateBucket: parseTemplateBucket(record.templateBucket),
    tags: parseTags(record.tags),
    parameters: parseParameters(record.parameters),
  })
}
