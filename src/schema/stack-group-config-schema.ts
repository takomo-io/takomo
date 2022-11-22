import Joi, { ObjectSchema } from "joi"
import { Region } from "../takomo-aws-model"
import { createCommonSchema } from "../takomo-core"
import { createAwsSchemas } from "./aws-schema"
import { createStacksSchemas } from "./stacks-schema"

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
    obsolete,
    terminationProtection,
    templateBucket,
    hooks,
    timeoutInMinutes,
    timeoutObject,
    schemas,
    inheritTags,
    blueprintPath,
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
    obsolete,
    terminationProtection,
    timeout,
    schemas,
    inheritTags,
    blueprint: blueprintPath,
    accountIds: [accountId, accountIds],
    commandRole: iamRoleArn,
    capabilities: stackCapabilities,
    stackPolicy: json,
    stackPolicyDuringUpdate: json,
  })
}
