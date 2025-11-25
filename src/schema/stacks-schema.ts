import Joi, {
  ArraySchema,
  BooleanSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
} from "joi"
import { Region } from "../aws/common/model.js"
import { createAwsSchemas } from "./aws-schema.js"

interface CreateStacksSchemasProps {
  readonly regions: ReadonlyArray<Region>
}

export interface StacksSchemas {
  commandPath: StringSchema
  stackGroupPath: StringSchema
  stackPath: StringSchema
  relativeStackPath: StringSchema
  stackGroupName: StringSchema
  terminationProtection: BooleanSchema
  ignore: BooleanSchema
  obsolete: BooleanSchema
  inheritTags: BooleanSchema
  template: (StringSchema | ObjectSchema)[]
  parameters: ObjectSchema
  hooks: ArraySchema
  timeoutObject: ObjectSchema
  timeoutInMinutes: NumberSchema
  hookName: StringSchema
  hookStage: StringSchema
  hookResult: StringSchema
  hookOperation: StringSchema
  templateBucket: ObjectSchema
  schemas: ObjectSchema
  blueprintPath: StringSchema
  customStackType: StringSchema
}

export const createStacksSchemas = (
  props: CreateStacksSchemasProps,
): StacksSchemas => {
  const awsSchema = createAwsSchemas(props)

  const timeoutInMinutes = Joi.number().integer().min(0)

  const timeoutObject = Joi.object({
    create: timeoutInMinutes,
    update: timeoutInMinutes,
  })

  const templateBucket = Joi.object({
    name: Joi.string().required(),
    keyPrefix: Joi.string(),
  })

  const hookName = Joi.string()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z]+[a-zA-Z0-9-_]*$/)

  const hookType = Joi.string()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z]+[a-zA-Z0-9-_]*$/)

  const hookStage = Joi.string().valid("before", "after")
  const hookOperation = Joi.string().valid("create", "update", "delete")
  const hookResult = Joi.string().valid(
    "success",
    "failed",
    "cancelled",
    "skipped",
  )

  const hook = Joi.object({
    name: hookName.required(),
    type: hookType.required(),
    operation: [hookOperation, Joi.array().items(hookOperation).unique()],
    stage: [hookStage, Joi.array().items(hookStage).unique()],
    status: [hookResult, Joi.array().items(hookResult).unique()],
  }).unknown(true)

  const hooks = Joi.array()
    .items(hook)
    .custom((value, helpers) => {
      if (!value || value.length === 0) {
        return value
      }

      const collected = new Map<string, number>()
      for (let i = 0; i < value.length; i++) {
        const hook = value[i]
        const name = hook.name
        const existing = collected.get(name)
        if (existing !== undefined) {
          return helpers.error("duplicateName", {
            index: i,
            name,
            other: existing,
          })
        }

        collected.set(name, i)
      }

      return value
    })
    .messages({
      duplicateName:
        '{{#label}}[{{#index}}] has a non-unique name "{{#name}}", which is used also by "hooks[{{#other}}]"',
    })

  const templateFilename = Joi.string().min(1)

  const templateFilenameObject = Joi.object({
    filename: templateFilename.required(),
    dynamic: Joi.boolean(),
  })

  const templateInlineObject = Joi.object({
    inline: Joi.string().required(),
    dynamic: Joi.boolean(),
  })

  const templateDynamicObject = Joi.object({
    dynamic: Joi.boolean().required(),
  })

  const template = [
    templateFilename,
    templateFilenameObject,
    templateInlineObject,
    templateDynamicObject,
  ]

  const parameterSchema = [
    Joi.string(),
    Joi.object({ name: Joi.string().required() }).unknown(true),
  ]

  const staticStringParameterValue = Joi.string().allow("").required()
  const staticNumberParameterValue = Joi.number().required()
  const staticBooleanParameterValue = Joi.boolean().required()
  const resolverParameterValue = Joi.object({
    resolver: Joi.string()
      .required()
      .min(1)
      .max(60)
      .regex(/^[a-zA-Z]+[a-zA-Z0-9-_]*$/),
    confidential: Joi.boolean(),
    immutable: Joi.boolean(),
    schema: parameterSchema,
  }).unknown(true)

  const configurableStaticParameterValue = Joi.object({
    confidential: Joi.boolean(),
    immutable: Joi.boolean(),
    schema: parameterSchema,
    value: [
      staticStringParameterValue,
      staticNumberParameterValue,
      staticBooleanParameterValue,
      Joi.array().items(
        staticStringParameterValue.optional(),
        staticNumberParameterValue.optional(),
        staticBooleanParameterValue.optional(),
      ),
    ],
  })

  const listParameterValue = Joi.array().items(
    staticStringParameterValue.optional(),
    staticNumberParameterValue.optional(),
    staticBooleanParameterValue.optional(),
    resolverParameterValue.optional(),
  )

  const parameters = Joi.object().pattern(awsSchema.parameterName, [
    staticStringParameterValue,
    staticNumberParameterValue,
    staticBooleanParameterValue,
    resolverParameterValue,
    listParameterValue,
    configurableStaticParameterValue,
  ])

  const ignore = Joi.boolean()
  const obsolete = Joi.boolean()
  const terminationProtection = Joi.boolean()
  const customStackType = Joi.string()

  const stackPath = Joi.string()
    .max(100)
    .regex(/^(\/[a-zA-Z][a-zA-Z0-9-]*)+\.yml\/?/)
    .custom((value, helpers) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [path, regionPart] = value.split(".yml", 2)
      if (!regionPart) {
        return value
      }

      const region = regionPart.slice(1)
      if (!props.regions.includes(region)) {
        return helpers.error("invalidRegion", {
          region,
          regions: props.regions.join(", "),
        })
      }

      return value
    }, "stack path")
    .messages({
      invalidRegion:
        '{{#label}} with value "{{#value}}" has invalid region "{{#region}}". The region must be one of [{{#regions}}]',
    })

  const relativeStackPath = Joi.string()
    .max(100)
    .regex(/^(((\/|(\.\.\/)+)?)[a-zA-Z][a-zA-Z0-9-]*)+\.yml\/?/)
    .custom((value, helpers) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [path, regionPart] = value.split(".yml", 2)
      if (!regionPart) {
        return value
      }

      const region = regionPart.slice(1)
      if (!props.regions.includes(region)) {
        return helpers.error("invalidRegion", {
          region,
          regions: props.regions.join(", "),
        })
      }

      return value
    }, "stack path")
    .messages({
      invalidRegion:
        '{{#label}} with value "{{#value}}" has invalid region "{{#region}}". The region must be one of [{{#regions}}]',
    })

  const stackGroupName = Joi.string().regex(/^[a-zA-Z][a-zA-Z0-9-]*$/)

  const stackGroupPath = Joi.string()
    .max(100)
    .regex(/^\/$|^(\/[a-zA-Z][a-zA-Z0-9-]*)+$/)

  const commandPath = Joi.string()
    .max(128)
    .custom((value, helpers) => {
      const regex = /^\/$|^(\/[a-zA-Z][a-zA-Z0-9-]*)+(\.yml(\/([a-z0-9-]+))?)?$/
      if (!regex.test(value)) {
        return helpers.error("string.pattern.base", { regex })
      }

      const groups = value.match(regex)
      const region = groups[4]
      if (!region) {
        return value
      }

      if (!props.regions.includes(region)) {
        return helpers.error("invalidRegion", {
          region,
          regions: props.regions.join(", "),
        })
      }

      return value
    }, "command path")
    .messages({
      invalidRegion:
        '{{#label}} with value "{{#value}}" has invalid region "{{#region}}". The region must be one of [{{#regions}}]',
    })

  const schemaName = Joi.string()
  const schemaObject = Joi.object({ name: schemaName.required() }).unknown(true)

  const schemas = Joi.object({
    data: [
      schemaName,
      schemaObject,
      Joi.array().items(schemaName, schemaObject),
    ],
    tags: [
      schemaName,
      schemaObject,
      Joi.array().items(schemaName, schemaObject),
    ],
    name: [
      schemaName,
      schemaObject,
      Joi.array().items(schemaName, schemaObject),
    ],
    parameters: [
      schemaName,
      schemaObject,
      Joi.array().items(schemaName, schemaObject),
    ],
  })

  const inheritTags = Joi.boolean()

  const blueprintPath = Joi.string()
    .max(100)
    .regex(/^([a-zA-Z][a-zA-Z0-9-_/]*)+\.yml/)

  return {
    commandPath,
    stackGroupPath,
    stackPath,
    relativeStackPath,
    stackGroupName,
    terminationProtection,
    ignore,
    obsolete,
    parameters,
    template,
    hooks,
    timeoutObject,
    timeoutInMinutes,
    hookName,
    hookOperation,
    hookStage,
    hookResult,
    templateBucket,
    schemas,
    inheritTags,
    blueprintPath,
    customStackType,
  }
}
