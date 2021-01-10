import Joi, { StringSchema } from "joi"

export interface DeploymentTargetsSchemas {
  readonly deploymentTargetName: StringSchema
  readonly deploymentGroupPath: StringSchema
}

export const createDeploymentTargetsSchemas = (): DeploymentTargetsSchemas => {
  const deploymentGroupPath = Joi.string()
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

  const deploymentTargetName = Joi.string()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z_]+[a-zA-Z0-9-_]*$/)

  return {
    deploymentTargetName,
    deploymentGroupPath,
  }
}
