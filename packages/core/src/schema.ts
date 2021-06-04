import Joi, { AnySchema, ObjectSchema, StringSchema } from "joi"

export interface CommonSchema {
  readonly data: ObjectSchema
  readonly vars: ObjectSchema
  readonly variableName: StringSchema
  readonly project: StringSchema
  readonly json: AnySchema
}

export const createCommonSchema = (): CommonSchema => {
  const project = Joi.string()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z]+[a-zA-Z0-9-]*$/)

  const variableName = Joi.string()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z_]+[a-zA-Z0-9-_]*$/)

  const vars = Joi.object().pattern(variableName, Joi.any())

  const data = vars

  const json = Joi.any()
    .custom((value, helpers) => {
      const type = typeof value
      if (!["string", "object"].includes(type)) {
        return helpers.error("invalidType")
      }

      if (Array.isArray(value)) {
        return helpers.error("invalidType")
      }

      if (type === "string") {
        try {
          JSON.parse(value)
        } catch (e) {
          return helpers.error("parseError", { error: e.message })
        }
      }

      return value
    })
    .messages({
      invalidType: "{{#label}} must be a string or object",
      parseError: "{{#label}} is not valid JSON: {{#error}}",
    })

  return {
    data,
    vars,
    variableName,
    project,
    json,
  }
}
