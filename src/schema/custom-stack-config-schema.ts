import Joi, { ObjectSchema } from "joi"
import { Region } from "../aws/common/model.js"
import { createAwsSchemas } from "./aws-schema.js"
import { createCommonSchema } from "./common-schema.js"
import { createStacksSchemas } from "./stacks-schema.js"

interface CreateCustomStackConfigSchemaProps {
  readonly regions: ReadonlyArray<Region>
}

export const createCustomStackConfigSchema = (
  props: CreateCustomStackConfigSchemaProps,
): ObjectSchema => {
  const { project, data } = createCommonSchema()
  const { regions, stackName, tags, iamRoleArn, accountId, accountIds } =
    createAwsSchemas({
      ...props,
    })

  const {
    ignore,
    obsolete,
    terminationProtection,
    timeoutInMinutes,
    timeoutObject,
    relativeStackPath,
    parameters,
    schemas,
    inheritTags,
    customStackType,
  } = createStacksSchemas({ ...props })

  const timeout = [timeoutInMinutes, timeoutObject]
  const stackPaths = Joi.array().items(relativeStackPath).unique()
  const customConfig = Joi.any()

  return Joi.object({
    project,
    regions,
    ignore,
    obsolete,
    terminationProtection,
    tags,
    data,
    parameters,
    timeout,
    schemas,
    inheritTags,
    customConfig,
    accountIds: [accountId, accountIds],
    commandRole: iamRoleArn,
    name: stackName,
    depends: [relativeStackPath, stackPaths],
    customType: customStackType,
  })
}
