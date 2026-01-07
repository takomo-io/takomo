import Joi, { ObjectSchema } from "joi"
import { Region } from "../aws/common/model.js"
import { createAwsSchemas } from "./aws-schema.js"
import { createCommonSchema } from "./common-schema.js"
import { createStacksSchemas } from "./stacks-schema.js"

interface CreateStandardStackConfigSchemaProps {
  readonly regions: ReadonlyArray<Region>
  readonly configType: "stack" | "blueprint"
}

export const createStandardStackConfigSchema = (
  props: CreateStandardStackConfigSchemaProps,
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
    obsolete,
    terminationProtection,
    templateBucket,
    template,
    hooks,
    timeoutInMinutes,
    timeoutObject,
    relativeStackPath,
    parameters,
    schemas,
    inheritTags,
    blueprintPath,
    customStackType,
  } = createStacksSchemas({ ...props })

  const timeout = [timeoutInMinutes, timeoutObject]
  const stackPaths = Joi.array().items(relativeStackPath).unique()

  const blueprint =
    props.configType === "stack" ? blueprintPath : blueprintPath.forbidden()

  return Joi.object({
    project,
    regions,
    ignore,
    obsolete,
    terminationProtection,
    templateBucket,
    tags,
    hooks,
    data,
    template,
    parameters,
    timeout,
    schemas,
    inheritTags,
    blueprint,
    accountIds: [accountId, accountIds],
    commandRole: iamRoleArn,
    name: stackName,
    depends: [relativeStackPath, stackPaths],
    capabilities: stackCapabilities,
    stackPolicy: json,
    stackPolicyDuringUpdate: json,
    type: customStackType,
  })
}
