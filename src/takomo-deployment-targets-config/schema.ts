import Joi, { ObjectSchema } from "joi"
import { Region } from "../takomo-aws-model"
import { createAwsSchemas } from "../takomo-aws-schema"
import { createConfigSetsSchemas } from "../takomo-config-sets"
import { createCommonSchema } from "../takomo-core"
import { createDeploymentTargetsSchemas } from "../takomo-deployment-targets-schema"

interface CreateDeploymentTargetsConfigSchemaProps {
  readonly regions: ReadonlyArray<Region>
}

export const createDeploymentTargetsConfigSchema = (
  props: CreateDeploymentTargetsConfigSchemaProps,
): ObjectSchema => {
  const { deploymentGroupPath, deploymentTarget, label } =
    createDeploymentTargetsSchemas({ ...props })

  const { configSetName, configSets } = createConfigSetsSchemas({ ...props })
  const { vars } = createCommonSchema()
  const { iamRoleArn, iamRoleName } = createAwsSchemas({ ...props })

  const targets = Joi.array().items(deploymentTarget)

  const targetsSchema = [
    Joi.string(),
    Joi.object({ name: Joi.string().required() }).unknown(true),
  ]

  const deploymentGroup = Joi.object({
    vars,
    targets,
    targetsSchema,
    description: Joi.string(),
    deploymentRole: iamRoleArn,
    deploymentRoleName: iamRoleName,
    bootstrapRole: iamRoleArn,
    bootstrapRoleName: iamRoleName,
    status: Joi.string().valid("active", "disabled"),
    priority: Joi.number().integer().min(0),
    configSets: [Joi.array().items(configSetName).unique(), configSetName],
    labels: [Joi.array().items(label).unique(), label],
    bootstrapConfigSets: [
      Joi.array().items(configSetName).unique(),
      configSetName,
    ],
  })

  const deploymentGroups = Joi.object()
    .pattern(deploymentGroupPath, deploymentGroup)
    .required()

  return Joi.object({
    targetsSchema,
    vars,
    deploymentGroups,
    configSets,
    deploymentRole: iamRoleArn,
    deploymentRoleName: iamRoleName,
    bootstrapRole: iamRoleArn,
    bootstrapRoleName: iamRoleName,
  })
}
