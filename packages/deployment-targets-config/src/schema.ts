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
    deploymentTarget,
  } = createDeploymentTargetsSchemas({ ...props })

  const { configSetName, configSets } = createConfigSetsSchemas({ ...props })
  const { vars } = createCommonSchema()
  const { iamRoleArn, iamRoleName } = createAwsSchemas({ ...props })

  const targets = Joi.array().items(deploymentTarget)

  const deploymentGroup = Joi.object({
    vars,
    targets,
    description: Joi.string(),
    deploymentRole: iamRoleArn,
    deploymentRoleName: iamRoleName,
    bootstrapRole: iamRoleArn,
    bootstrapRoleName: iamRoleName,
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
