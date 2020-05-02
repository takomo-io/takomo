import Joi from "@hapi/joi"
import { commandPath, vars } from "@takomo/core"

export const configSetName = Joi.string()
  .min(1)
  .max(60)
  .regex(/^[a-zA-Z_]+[a-zA-Z0-9-_]*$/)

export const configSet = Joi.object({
  description: Joi.string(),
  commandPaths: Joi.array().items(commandPath).unique(),
  vars,
})

export const configSets = Joi.object().pattern(configSetName, configSet)
