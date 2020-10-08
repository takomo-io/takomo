import Joi from "joi"

export const takomoProjectConfigFileSchema = Joi.object({
  requiredVersion: Joi.string(),
})
