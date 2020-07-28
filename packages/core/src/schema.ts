import Joi from "@hapi/joi"
import { REGIONS } from "./constants"

export const accountId = Joi.string().regex(/^\d{12}$/)

export const accountIds = Joi.array().items(accountId).unique()

export const variableName = Joi.string()
  .min(1)
  .max(60)
  .regex(/^[a-zA-Z_]+[a-zA-Z0-9-_]*$/)

export const vars = Joi.object().pattern(variableName, Joi.any())

export const iamRoleName = Joi.string()
  .min(1)
  .max(64)
  .regex(/^[\w+=/,.@-]+$/)

export const commandPath = Joi.string()
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

    if (!REGIONS.includes(region)) {
      return helpers.error("invalidRegion", {
        region,
        regions: REGIONS.join(", "),
      })
    }

    return value
  }, "command path")
  .messages({
    invalidRegion:
      '{{#label}} with value "{{#value}}" has invalid region "{{#region}}". The region must be one of [{{#regions}}]',
  })

export const iamRoleArn = Joi.string().regex(/^arn:aws:iam::\d{12}:role\/.+$/)

export const project = Joi.string()
  .min(1)
  .max(60)
  .regex(/^[a-zA-Z]+[a-zA-Z0-9-]*$/)

export const region = Joi.string().valid(...REGIONS)

export const regions = [region, Joi.array().items(region).unique()]

export const data = vars

export const stackPath = Joi.string()
  .max(100)
  .regex(/^(\/[a-zA-Z][a-zA-Z0-9-]*)+\.yml\/?/)
  .custom((value, helpers) => {
    const [path, regionPart] = value.split(".yml", 2)
    if (!regionPart) {
      return value
    }

    const region = regionPart.substr(1)
    if (!REGIONS.includes(region)) {
      return helpers.error("invalidRegion", {
        region,
        regions: REGIONS.join(", "),
      })
    }

    return value
  }, "stack path")
  .messages({
    invalidRegion:
      '{{#label}} with value "{{#value}}" has invalid region "{{#region}}". The region must be one of [{{#regions}}]',
  })

export const stackPaths = Joi.array().items(stackPath).unique()

export const stackGroupName = Joi.string().regex(/^[a-zA-Z][a-zA-Z0-9-]*$/)

export const stackGroupPath = Joi.string()
  .max(100)
  .regex(/^\/$|^(\/[a-zA-Z][a-zA-Z0-9-]*)+$/)

export const stackName = Joi.string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z][a-zA-Z0-9-]*$/)
