import { Region } from "@takomo/aws-model"
import { createAwsSchemas } from "@takomo/aws-schema"
import { createConfigSetsSchemas } from "@takomo/config-sets"
import { createCommonSchema } from "@takomo/core"
import { createDeploymentTargetsSchemas } from "@takomo/deployment-targets-schema"
import Joi, { ObjectSchema } from "joi"

interface CreateDeploymentTargetsConfigSchemaProps {
  readonly regions: ReadonlyArray<Region>
}

export const createDeploymentTargetsConfigSchema = (
  props: CreateDeploymentTargetsConfigSchemaProps,
): ObjectSchema => {
  const {
    deploymentGroupPath,
    deploymentTargetName,
  } = createDeploymentTargetsSchemas()

  const { configSetName, configSets } = createConfigSetsSchemas({ ...props })
  const { vars } = createCommonSchema()
  const { accountId, iamRoleArn } = createAwsSchemas({ ...props })

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

  const targets = Joi.array().items(deploymentTarget)

  const deploymentGroup = Joi.object({
    vars,
    targets,
    description: Joi.string(),
    deploymentRole: iamRoleArn,
    bootstrapRole: iamRoleArn,
    status: Joi.string().valid("active", "disabled"),
    priority: Joi.number().integer().min(0),
    configSets: [Joi.array().items(configSetName).unique(), configSetName],
    bootstrapConfigSets: [
      Joi.array().items(configSetName).unique(),
      configSetName,
    ],
  })

  const deploymentGroups = Joi.object()
    .pattern(deploymentGroupPath, deploymentGroup)
    .required()

  return Joi.object({
    deploymentGroups,
    configSets,
  })
}
