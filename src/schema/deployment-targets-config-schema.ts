import Joi, { ObjectSchema } from "joi"
import { Region } from "../aws/common/model.js"
import { createAwsSchemas } from "./aws-schema.js"
import { createCommonSchema } from "./common-schema.js"
import { createConfigSetsSchemas } from "./config-sets-schema.js"
import { createDeploymentTargetsSchemas } from "./deployment-targets-schema.js"

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
    status: Joi.string().valid("active", "disabled"),
    priority: Joi.number().integer().min(0),
    configSets: [Joi.array().items(configSetName).unique(), configSetName],
    labels: [Joi.array().items(label).unique(), label],
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
  })
}
