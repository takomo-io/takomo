import Joi from "@hapi/joi"
import { configSetName } from "@takomo/config-sets"
import { iamRoleArn, vars } from "@takomo/core"

export const deploymentGroupPath = Joi.string()
  .min(1)
  .max(250)
  .custom((value, helpers) => {
    const regex = /^[_a-zA-Z0-9][a-zA-Z0-9-_/ ]+$/

    if (!regex.test(value)) {
      return helpers.error("string.pattern.base", { regex })
    }

    if (value.endsWith(" ")) {
      return helpers.error("endsWithWhitespace")
    }
    if (value.includes("  ")) {
      return helpers.error("subsequentWhitespace")
    }
    if (value.includes("//")) {
      return helpers.error("subsequentSeparators")
    }
    if (value.endsWith("/")) {
      return helpers.error("endsWithSeparator")
    }

    const parts = value.split("/")
    if (parts.length > 10) {
      return helpers.error("maxDepth")
    }

    return value
  })
  .messages({
    maxDepth: "{{#label}} hierarchy depth must not exceed 10",
    endsWithWhitespace: "{{#label}} must not end with whitespace",
    endsWithSeparator: "{{#label}} must not end with path separator (/)",
    subsequentSeparators:
      "{{#label}} must not contain subsequent path separators (/)",
    subsequentWhitespace: "{{#label}} must not contain subsequent whitespace",
  })

export const deploymentTargetName = Joi.string()
  .min(1)
  .max(60)
  .regex(/^[a-zA-Z_]+[a-zA-Z0-9-_]*$/)

const deploymentTarget = Joi.object({
  vars,
  name: deploymentTargetName.required(),
  deploymentRole: iamRoleArn,
  description: Joi.string(),
  status: Joi.string().valid("active", "disabled"),
  configSets: [Joi.array().items(configSetName).unique(), configSetName],
})

const targets = Joi.array().items(deploymentTarget)

const deploymentGroup = Joi.object({
  vars,
  targets,
  description: Joi.string(),
  deploymentRole: iamRoleArn,
  status: Joi.string().valid("active", "disabled"),
  priority: Joi.number().integer().min(0),
  configSets: [Joi.array().items(configSetName).unique(), configSetName],
})

export const deploymentGroups = Joi.object()
  .pattern(deploymentGroupPath, deploymentGroup)
  .required()
