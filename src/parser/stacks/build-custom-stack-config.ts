import { err, ok, Result } from "neverthrow"
import { CommandContext } from "../../context/command-context.js"
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
import { parseTags } from "./parse-tags.js"
import { parseTimeout } from "./parse-timeout.js"
import { parseCustomStackType } from "./parse-custom-stack-type.js"
import { CustomStackConfig } from "../../config/custom-stack-config.js"
import { createCustomStackConfigSchema } from "../../schema/custom-stack-config-schema.js"

export const buildCustomStackConfig = (
  ctx: CommandContext,
  record: Record<string, unknown>,
): Result<CustomStackConfig, ValidationError> => {
  const { error } = createCustomStackConfigSchema({
    regions: ctx.regions,
  }).validate(record, {
    abortEarly: false,
    convert: false,
  })

  if (error) {
    const details = error.details.map((d) => d.message)
    return err(
      new ValidationError(
        "Validation errors in custom stack configuration",
        details,
      ),
    )
  }

  const customType = parseCustomStackType(record.customType)
  const schemas = parseSchemas(record.schemas)
  const data = parseData(record.data)
  const hooks = parseHooks(record.hooks)
  const accountIds = parseAccountIds(record.accountIds)

  return ok({
    stackType: "custom",
    customConfig: record.customConfig ?? {},
    customType,
    accountIds,
    data,
    hooks,
    schemas,
    ignore: parseOptionalBoolean(record.ignore),
    obsolete: parseOptionalBoolean(record.obsolete),
    terminationProtection: parseOptionalBoolean(record.terminationProtection),
    project: parseOptionalString(record.project),
    commandRole: parseCommandRole(record.commandRole),
    regions: parseStringArray(record.regions),
    name: parseOptionalString(record.name),
    timeout: parseTimeout(record.timeout),
    depends: parseOptionalStringArray(record.depends),
    tags: parseTags(record.tags),
    inheritTags: parseOptionalBoolean(record.inheritTags),
    parameters: parseParameters(record.parameters),
  })
}
