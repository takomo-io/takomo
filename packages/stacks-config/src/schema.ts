import {
  accountId,
  accountIds,
  data,
  iamRoleArn,
  project,
  regions,
  stackName,
  stackPath,
  stackPaths,
} from "@takomo/core"
import {
  hooks,
  ignore,
  parameters,
  secrets,
  stackCapabilities,
  tags,
  template,
  templateBucket,
  terminationProtection,
  timeout,
} from "@takomo/stacks-schema"
import Joi from "joi"

export const stackGroupConfigFileSchema = Joi.object({
  project,
  templateBucket,
  tags,
  hooks,
  data,
  regions,
  ignore,
  terminationProtection,
  accountIds: [accountId, accountIds],
  timeout,
  commandRole: iamRoleArn,
  capabilities: stackCapabilities,
})

export const stackConfigFileSchema = Joi.object({
  project,
  regions,
  ignore,
  terminationProtection,
  accountIds: [accountId, accountIds],
  commandRole: iamRoleArn,
  templateBucket,
  tags,
  hooks,
  data,
  template,
  parameters,
  secrets,
  timeout,
  name: stackName,
  depends: [stackPath, stackPaths],
  capabilities: stackCapabilities,
})
