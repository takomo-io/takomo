import { Region } from "@takomo/aws-model"
import { createAwsSchemas } from "@takomo/aws-schema"
import { createCommonSchema } from "@takomo/core"
import { createStacksSchemas } from "@takomo/stacks-schema"
import Joi, { ObjectSchema } from "joi"

interface CreateStackGroupConfigSchemaProps {
  readonly regions: ReadonlyArray<Region>
}

export const createStackGroupConfigSchema = (
  props: CreateStackGroupConfigSchemaProps,
): ObjectSchema => {
  const { project, data, json } = createCommonSchema()
  const {
    regions,
    tags,
    iamRoleArn,
    accountId,
    accountIds,
    stackCapabilities,
  } = createAwsSchemas({
    ...props,
  })

  const {
    ignore,
    terminationProtection,
    templateBucket,
    hooks,
    timeoutInMinutes,
    timeoutObject,
    schemas,
  } = createStacksSchemas({ ...props })

  const timeout = [timeoutInMinutes, timeoutObject]

  return Joi.object({
    project,
    templateBucket,
    tags,
    hooks,
    data,
    regions,
    ignore,
    terminationProtection,
    timeout,
    schemas,
    accountIds: [accountId, accountIds],
    commandRole: iamRoleArn,
    capabilities: stackCapabilities,
    stackPolicy: json,
    stackPolicyDuringUpdate: json,
  })
}

interface CreateStackConfigSchemaProps {
  readonly regions: ReadonlyArray<Region>
}

export const createStackConfigSchema = (
  props: CreateStackConfigSchemaProps,
): ObjectSchema => {
  const { project, data, json } = createCommonSchema()
  const {
    regions,
    stackName,
    tags,
    iamRoleArn,
    accountId,
    accountIds,
    stackCapabilities,
  } = createAwsSchemas({
    ...props,
  })

  const {
    ignore,
    terminationProtection,
    templateBucket,
    template,
    hooks,
    timeoutInMinutes,
    timeoutObject,
    relativeStackPath,
    parameters,
    schemas,
  } = createStacksSchemas({ ...props })

  const timeout = [timeoutInMinutes, timeoutObject]
  const stackPaths = Joi.array().items(relativeStackPath).unique()

  return Joi.object({
    project,
    regions,
    ignore,
    terminationProtection,
    templateBucket,
    tags,
    hooks,
    data,
    template,
    parameters,
    timeout,
    schemas,
    accountIds: [accountId, accountIds],
    commandRole: iamRoleArn,
    name: stackName,
    depends: [relativeStackPath, stackPaths],
    capabilities: stackCapabilities,
    stackPolicy: json,
    stackPolicyDuringUpdate: json,
  })
}
