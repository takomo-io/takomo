import { Region } from "@takomo/aws-model"
import { createAwsSchemas } from "@takomo/aws-schema"
import { createConfigSetsSchemas } from "@takomo/config-sets"
import { createCommonSchema } from "@takomo/core"
import Joi, { ObjectSchema, StringSchema } from "joi"

export interface DeploymentTargetsSchemas {
  readonly deploymentTargetName: StringSchema
  readonly deploymentGroupPath: StringSchema
  readonly deploymentTarget: ObjectSchema
}

interface CreateDeploymentTargetsSchemaProps {
  readonly regions: ReadonlyArray<Region>
}

export const createDeploymentTargetsSchemas = (
  props: CreateDeploymentTargetsSchemaProps,
): DeploymentTargetsSchemas => {
  const { vars } = createCommonSchema()
  const { configSetName } = createConfigSetsSchemas({ ...props })
  const { accountId, iamRoleArn } = createAwsSchemas({ ...props })

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

  const deploymentTarget = Joi.object({
    vars,
    accountId,
    name: deploymentTargetName.required(),
    deploymentRole: iamRoleArn,
    bootstrapRole: iamRoleArn,
    description: Joi.string(),
    status: Joi.string().valid("active", "disabled"),
    configSets: [Joi.array().items(configSetName).unique(), configSetName],
    bootstrapConfigSets: [
      Joi.array().items(configSetName).unique(),
      configSetName,
    ],
  })

  return {
    deploymentTargetName,
    deploymentGroupPath,
    deploymentTarget,
  }
}
