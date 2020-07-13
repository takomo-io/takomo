import Joi from "@hapi/joi"

export const takomoProjectConfigFileSchema = Joi.object({
  requiredVersion: Joi.string(),
})
