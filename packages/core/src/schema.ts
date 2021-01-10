import Joi, { ObjectSchema, StringSchema } from "joi"

export interface CommonSchema {
  readonly data: ObjectSchema
  readonly vars: ObjectSchema
  readonly variableName: StringSchema
  readonly project: StringSchema
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

  return {
    data,
    vars,
    variableName,
    project,
  }
}
