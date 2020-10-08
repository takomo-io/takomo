import Joi from "joi"

export const stackCapability = Joi.string().valid(
  "CAPABILITY_IAM",
  "CAPABILITY_NAMED_IAM",
  "CAPABILITY_AUTO_EXPAND",
)

export const stackCapabilities = [
  stackCapability,
  Joi.array().items(stackCapability).unique(),
]

export const timeoutInMinutes = Joi.number().integer().min(0)

export const timeoutObject = Joi.object({
  create: timeoutInMinutes,
  update: timeoutInMinutes,
})

export const timeout = [timeoutInMinutes, timeoutObject]

export const templateBucket = Joi.object({
  name: Joi.string().required(),
  keyPrefix: Joi.string(),
})

export const hookName = Joi.string()
  .min(1)
  .max(60)
  .regex(/^[a-zA-Z]+[a-zA-Z0-9-_]*$/)

export const hookType = Joi.string()
  .min(1)
  .max(60)
  .regex(/^[a-zA-Z]+[a-zA-Z0-9-_]*$/)

export const hookStage = Joi.string().valid("before", "after")
export const hookOperation = Joi.string().valid("create", "update", "delete")
export const hookResult = Joi.string().valid(
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

export const hooks = Joi.array()
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

export const tagName = Joi.string().min(1).max(127)

export const tagValue = Joi.any()
  .custom((value, helpers) => {
    const type = typeof value
    if (!["string", "number", "boolean"].includes(type)) {
      return helpers.error("invalidType")
    }

    const stringValue = `${value}`
    if (stringValue === "") {
      return helpers.error("empty")
    }

    const limit = 255
    if (stringValue.length > limit) {
      return helpers.error("maxLength", { limit })
    }

    return stringValue
  })
  .messages({
    invalidType: "{{#label}} must be a string, number or boolean",
    empty: "{{#label}} is not allowed to be empty",
    maxLength:
      "{{#label}} length must be less than or equal to {{#limit}} characters long",
  })

export const tags = Joi.object().pattern(tagName, tagValue)

export const template = Joi.string().min(1)

// TODO: Validate parameter name allowed characters
export const parameterName = Joi.string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9]+$/)

export const stackOutputName = Joi.string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9]+$/)

export const staticStringParameterValue = Joi.string().required()
export const staticNumberParameterValue = Joi.number().required()
export const staticBooleanParameterValue = Joi.boolean().required()
export const resolverParameterValue = Joi.object({
  resolver: Joi.string()
    .required()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z]+[a-zA-Z0-9-_]*$/),
  confidential: Joi.boolean(),
}).unknown(true)

export const listParameterValue = Joi.array().items(
  staticStringParameterValue.optional(),
  staticNumberParameterValue.optional(),
  staticBooleanParameterValue.optional(),
  resolverParameterValue.optional(),
)

export const parameters = Joi.object().pattern(parameterName, [
  staticStringParameterValue,
  staticNumberParameterValue,
  staticBooleanParameterValue,
  resolverParameterValue,
  listParameterValue,
])

export const secretName = Joi.string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9-_]+$/)

export const secretDescription = Joi.string().min(1).max(255)

export const secret = Joi.object({
  description: secretDescription.required(),
}).unknown(false)

export const secrets = Joi.object().pattern(secretName, secret)

export const ignore = Joi.boolean()
export const terminationProtection = Joi.boolean()
