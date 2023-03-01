import Joi, { AnySchema, ArraySchema, ObjectSchema, StringSchema } from "joi"
import { Region } from "../aws/common/model.js"

export interface AwsSchemas {
  region: StringSchema
  regions: (StringSchema | ArraySchema)[]
  stackName: StringSchema
  iamRoleName: StringSchema
  iamRoleArn: StringSchema
  accountIds: ArraySchema
  accountId: StringSchema
  parameterName: StringSchema
  tags: ObjectSchema
  stackOutputName: StringSchema
  stackCapability: StringSchema
  stackCapabilities: (StringSchema | ArraySchema)[]
  tagName: StringSchema
  tagValue: AnySchema
  accountEmail: StringSchema
  accountName: StringSchema
  accountAlias: StringSchema
}

interface CreateAwsSchemasProps {
  readonly regions: ReadonlyArray<Region>
}

export const createAwsSchemas = (props: CreateAwsSchemasProps): AwsSchemas => {
  const stackCapability = Joi.string().valid(
    "CAPABILITY_IAM",
    "CAPABILITY_NAMED_IAM",
    "CAPABILITY_AUTO_EXPAND",
  )

  const stackCapabilities = [
    stackCapability,
    Joi.array().items(stackCapability).unique(),
  ]

  const tagName = Joi.string().min(1).max(127)

  const tagValue = Joi.any()
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

  const tags = Joi.object().pattern(tagName, tagValue)

  // TODO: Validate parameter name allowed characters
  const parameterName = Joi.string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9]+$/)

  const stackOutputName = Joi.string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9]+$/)

  const stackName = Joi.string()
    .min(1)
    .max(128)
    .regex(/^[a-zA-Z][a-zA-Z0-9-]*$/)

  const accountId = Joi.string().regex(/^\d{12}$/)

  const accountIds = Joi.array().items(accountId).unique()

  const iamRoleName = Joi.string()
    .min(1)
    .max(64)
    .regex(/^[\w+=/,.@-]+$/)

  const iamRoleArn = Joi.string().regex(/^arn:aws:iam::\d{12}:role\/.+$/)
  const region = Joi.string().valid(...props.regions)

  const regions = [region, Joi.array().items(region).unique()]

  const accountName = Joi.string().min(1).max(50)

  const accountEmail = Joi.string().email()

  // For account alias requirements, see https://docs.aws.amazon.com/IAM/latest/APIReference/API_CreateAccountAlias.html
  const accountAlias = Joi.string()
    .min(3)
    .max(63)
    .regex(/^[a-z0-9](([a-z0-9]|-(?!-))*[a-z0-9])?$/)

  return {
    region,
    regions,
    stackName,
    iamRoleName,
    iamRoleArn,
    accountIds,
    accountId,
    parameterName,
    tags,
    stackOutputName,
    stackCapability,
    stackCapabilities,
    tagName,
    tagValue,
    accountName,
    accountEmail,
    accountAlias,
  }
}
