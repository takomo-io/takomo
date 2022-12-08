import Joi, { ObjectSchema, StringSchema } from "joi"
import { Region } from "../aws/common/model"
import { createAwsSchemas } from "./aws-schema"
import { createCommonSchema } from "./common-schema"
import { createConfigSetsSchemas } from "./config-sets-schema"

export interface DeploymentTargetsSchemas {
  readonly deploymentTargetName: StringSchema
  readonly deploymentTargetNamePattern: StringSchema
  readonly deploymentGroupPath: StringSchema
  readonly label: StringSchema
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
  const { accountId, iamRoleArn, iamRoleName } = createAwsSchemas({ ...props })

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

  const label = Joi.string()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z_]+[a-zA-Z0-9-_]*$/)

  const deploymentTargetName = Joi.string()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z_]+[a-zA-Z0-9-_]*$/)

  const deploymentTargetNamePattern = Joi.string()
    .min(1)
    .max(60)
    .regex(/^%?[a-zA-Z0-9-_]+%?$/)

  const deploymentTarget = Joi.object({
    vars,
    accountId,
    name: deploymentTargetName.required(),
    deploymentRole: iamRoleArn,
    deploymentRoleName: iamRoleName,
    bootstrapRole: iamRoleArn,
    bootstrapRoleName: iamRoleName,
    description: Joi.string(),
    status: Joi.string().valid("active", "disabled"),
    configSets: [Joi.array().items(configSetName).unique(), configSetName],
    labels: [Joi.array().items(label).unique(), label],
    bootstrapConfigSets: [
      Joi.array().items(configSetName).unique(),
      configSetName,
    ],
  })

  return {
    deploymentTargetName,
    label,
    deploymentTargetNamePattern,
    deploymentGroupPath,
    deploymentTarget,
  }
}
